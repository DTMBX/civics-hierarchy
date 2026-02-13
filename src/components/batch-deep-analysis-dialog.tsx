import { useState, useEffect } from 'react'
import { SavedCitation, Document, Section } from '@/lib/types'
import { TagDefinition } from '@/components/tag-manager'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Warning, 
  Sparkle, 
  Play,
  Pause,
  Stop,
  ArrowRight,
  DownloadSimple,
  Tag
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BatchDeepAnalysisDialogProps {
  open: boolean
  onClose: () => void
  citations: SavedCitation[]
  documents: Document[]
  sections: Section[]
  allTags: TagDefinition[]
  onApplyTags: (citationId: string, tags: string[]) => void
}

interface AnalysisResult {
  citationId: string
  status: 'pending' | 'analyzing' | 'completed' | 'failed' | 'skipped'
  suggestedTags: string[]
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
  legalConcepts: string[]
  practiceAreas: string[]
  constitutionalIssues: string[]
  error?: string
  processingTime?: number
}

interface LLMAnalysisResult {
  suggestedTags: string[]
  legalConcepts: string[]
  practiceAreas: string[]
  constitutionalIssues: string[]
  reasoning: string
}

export function BatchDeepAnalysisDialog({
  open,
  onClose,
  citations,
  documents,
  sections,
  allTags,
  onApplyTags,
}: BatchDeepAnalysisDialogProps) {
  const [selectedCitations, setSelectedCitations] = useState<Set<string>>(new Set())
  const [analysisResults, setAnalysisResults] = useState<Map<string, AnalysisResult>>(new Map())
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoApplyHighConfidence, setAutoApplyHighConfidence] = useState(false)
  const [skipAlreadyTagged, setSkipAlreadyTagged] = useState(true)
  const [batchSize, setBatchSize] = useState(5)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedCitations(new Set(citations.map(c => c.id)))
      setAnalysisResults(new Map())
      setCurrentIndex(0)
      setIsRunning(false)
      setIsPaused(false)
      setShowResults(false)
    }
  }, [open, citations])

  const selectedCitationsList = citations.filter(c => selectedCitations.has(c.id))
  const totalSelected = selectedCitationsList.length
  const completed = Array.from(analysisResults.values()).filter(r => 
    r.status === 'completed' || r.status === 'failed' || r.status === 'skipped'
  ).length
  const progress = totalSelected > 0 ? (completed / totalSelected) * 100 : 0

  const analyzeSingleCitation = async (citation: SavedCitation): Promise<AnalysisResult> => {
    const startTime = Date.now()
    
    try {
      if (skipAlreadyTagged && citation.tags.length >= 3) {
        return {
          citationId: citation.id,
          status: 'skipped',
          suggestedTags: [],
          confidence: 'low',
          reasoning: 'Citation already has sufficient tags',
          legalConcepts: [],
          practiceAreas: [],
          constitutionalIssues: [],
          processingTime: Date.now() - startTime,
        }
      }

      const section = sections.find(s => s.id === citation.sectionId)
      const document = documents.find(d => d.id === citation.documentId)

      if (!section && !document) {
        return {
          citationId: citation.id,
          status: 'failed',
          suggestedTags: [],
          confidence: 'low',
          reasoning: '',
          legalConcepts: [],
          practiceAreas: [],
          constitutionalIssues: [],
          error: 'Section or document not found',
          processingTime: Date.now() - startTime,
        }
      }

      const contentToAnalyze = [
        `Title: ${citation.title}`,
        `Citation: ${citation.canonicalCitation}`,
        citation.notes ? `Notes: ${citation.notes}` : '',
        section?.title ? `Section: ${section.title}` : '',
        section?.text ? `Text: ${section.text.substring(0, 1000)}` : '',
        document?.title ? `Document: ${document.title}` : '',
        document?.description ? `Description: ${document.description}` : '',
      ].filter(Boolean).join('\n')

      const tagList = allTags
        .map(t => `- ${t.name} (${t.category}): ${t.description}`)
        .join('\n')

      const promptText = `You are a legal research assistant analyzing a citation from a law reference application. Your task is to suggest the most relevant tags from the available tag list.

CITATION CONTENT TO ANALYZE:
${contentToAnalyze}

AVAILABLE TAGS:
${tagList}

CURRENT TAGS: ${citation.tags.join(', ') || 'None'}

ANALYSIS INSTRUCTIONS:
1. Identify the key legal concepts, constitutional provisions, and practice areas mentioned
2. Suggest 3-8 most relevant tags from the available tag list that are NOT already applied
3. Focus on tags that would be most useful for legal research and case organization
4. Consider both explicit mentions and implicit legal themes
5. Prioritize accuracy and relevance over quantity
6. Assign a confidence level based on how well the content matches the suggested tags

Return your analysis as a JSON object with this exact structure:
{
  "suggestedTags": ["Tag Name 1", "Tag Name 2", "Tag Name 3"],
  "legalConcepts": ["concept1", "concept2"],
  "practiceAreas": ["area1", "area2"],
  "constitutionalIssues": ["issue1", "issue2"],
  "reasoning": "Brief explanation of why these tags are relevant"
}`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const llmResult = JSON.parse(response) as LLMAnalysisResult

      const newTags = llmResult.suggestedTags.filter(tag => 
        !citation.tags.includes(tag) && allTags.some(t => t.name === tag)
      )

      const confidence: 'high' | 'medium' | 'low' = 
        newTags.length >= 4 && (llmResult.legalConcepts.length > 2 || llmResult.constitutionalIssues.length > 0)
          ? 'high'
          : newTags.length >= 2
          ? 'medium'
          : 'low'

      return {
        citationId: citation.id,
        status: 'completed',
        suggestedTags: newTags,
        confidence,
        reasoning: llmResult.reasoning,
        legalConcepts: llmResult.legalConcepts,
        practiceAreas: llmResult.practiceAreas,
        constitutionalIssues: llmResult.constitutionalIssues,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      return {
        citationId: citation.id,
        status: 'failed',
        suggestedTags: [],
        confidence: 'low',
        reasoning: '',
        legalConcepts: [],
        practiceAreas: [],
        constitutionalIssues: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }
    }
  }

  const runBatchAnalysis = async () => {
    setIsRunning(true)
    setShowResults(false)
    
    const citationsToAnalyze = selectedCitationsList.slice(currentIndex)
    
    for (let i = 0; i < citationsToAnalyze.length; i++) {
      if (isPaused) {
        setCurrentIndex(currentIndex + i)
        break
      }

      const citation = citationsToAnalyze[i]
      
      setAnalysisResults(prev => {
        const newMap = new Map(prev)
        newMap.set(citation.id, {
          citationId: citation.id,
          status: 'analyzing',
          suggestedTags: [],
          confidence: 'low',
          reasoning: '',
          legalConcepts: [],
          practiceAreas: [],
          constitutionalIssues: [],
        })
        return newMap
      })

      const result = await analyzeSingleCitation(citation)
      
      setAnalysisResults(prev => {
        const newMap = new Map(prev)
        newMap.set(citation.id, result)
        return newMap
      })

      if (autoApplyHighConfidence && result.status === 'completed' && result.confidence === 'high') {
        const allCitationTags = [...citation.tags, ...result.suggestedTags]
        onApplyTags(citation.id, allCitationTags)
      }

      if ((i + 1) % batchSize === 0 && i < citationsToAnalyze.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    if (!isPaused) {
      setIsRunning(false)
      setShowResults(true)
      toast.success('Batch analysis completed', {
        description: `Analyzed ${totalSelected} citations successfully.`,
      })
    }
  }

  const handleStart = () => {
    if (selectedCitations.size === 0) {
      toast.error('Please select at least one citation to analyze')
      return
    }
    runBatchAnalysis()
  }

  const handlePause = () => {
    setIsPaused(true)
    setIsRunning(false)
  }

  const handleResume = () => {
    setIsPaused(false)
    runBatchAnalysis()
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    setShowResults(true)
  }

  const handleToggleCitation = (citationId: string) => {
    setSelectedCitations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(citationId)) {
        newSet.delete(citationId)
      } else {
        newSet.add(citationId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedCitations(new Set(citations.map(c => c.id)))
  }

  const handleDeselectAll = () => {
    setSelectedCitations(new Set())
  }

  const handleApplyResult = (citationId: string) => {
    const result = analysisResults.get(citationId)
    const citation = citations.find(c => c.id === citationId)
    if (result && citation && result.status === 'completed') {
      const allTags = [...citation.tags, ...result.suggestedTags]
      onApplyTags(citationId, allTags)
      toast.success('Tags applied successfully')
    }
  }

  const handleExportResults = () => {
    const results = Array.from(analysisResults.entries()).map(([id, result]) => {
      const citation = citations.find(c => c.id === id)
      return {
        citation: citation?.title,
        canonicalCitation: citation?.canonicalCitation,
        status: result.status,
        suggestedTags: result.suggestedTags,
        confidence: result.confidence,
        reasoning: result.reasoning,
        legalConcepts: result.legalConcepts,
        practiceAreas: result.practiceAreas,
        constitutionalIssues: result.constitutionalIssues,
        processingTime: result.processingTime,
      }
    })

    const exportData = {
      exportType: 'batch-deep-analysis',
      exportedAt: new Date().toISOString(),
      totalAnalyzed: results.length,
      results,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-analysis-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Analysis results exported')
  }

  const stats = {
    total: totalSelected,
    completed: Array.from(analysisResults.values()).filter(r => r.status === 'completed').length,
    failed: Array.from(analysisResults.values()).filter(r => r.status === 'failed').length,
    skipped: Array.from(analysisResults.values()).filter(r => r.status === 'skipped').length,
    highConfidence: Array.from(analysisResults.values()).filter(r => r.confidence === 'high').length,
    avgTime: Array.from(analysisResults.values())
      .filter(r => r.processingTime)
      .reduce((sum, r) => sum + (r.processingTime || 0), 0) / Math.max(1, completed),
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" weight="fill" />
            Batch Deep Analysis
          </DialogTitle>
          <DialogDescription>
            Run AI-powered deep analysis on multiple citations at once to automatically suggest relevant tags
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {!showResults ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Citations Selected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalSelected}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      of {citations.length} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Analysis Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{completed}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      citations analyzed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Estimated Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.ceil((totalSelected - completed) * 3)}s
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ~3s per citation
                    </p>
                  </CardContent>
                </Card>
              </div>

              {isRunning || isPaused ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isRunning ? (
                          <>
                            <Sparkle className="w-5 h-5 text-primary animate-pulse" weight="fill" />
                            <span className="font-semibold">Analyzing citations...</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-5 h-5 text-warning" weight="fill" />
                            <span className="font-semibold">Analysis paused</span>
                          </>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {completed} / {totalSelected}
                      </Badge>
                    </div>
                    
                    <Progress value={progress} className="h-2" />
                    
                    <div className="flex gap-2">
                      {isRunning ? (
                        <Button size="sm" variant="outline" onClick={handlePause}>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" onClick={handleResume}>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={handleStop}>
                        <Stop className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Analysis Options</Label>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-apply">Auto-apply high confidence tags</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically apply tags with high confidence scores
                          </p>
                        </div>
                        <Switch
                          id="auto-apply"
                          checked={autoApplyHighConfidence}
                          onCheckedChange={setAutoApplyHighConfidence}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="skip-tagged">Skip already tagged citations</Label>
                          <p className="text-xs text-muted-foreground">
                            Skip citations that already have 3+ tags
                          </p>
                        </div>
                        <Switch
                          id="skip-tagged"
                          checked={skipAlreadyTagged}
                          onCheckedChange={setSkipAlreadyTagged}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Select Citations</Label>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                          Select All
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                          Deselect All
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <div className="space-y-2">
                        {citations.map((citation) => {
                          const document = documents.find(d => d.id === citation.documentId)
                          const isSelected = selectedCitations.has(citation.id)
                          
                          return (
                            <div
                              key={citation.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                              }`}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleCitation(citation.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-1">{citation.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {citation.canonicalCitation}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {document?.title}
                                  </Badge>
                                  {citation.tags.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Tag className="w-3 h-3 mr-1" />
                                      {citation.tags.length}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.completed}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Sparkle className="w-4 h-4 text-primary" />
                      High Conf.
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.highConfidence}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Warning className="w-4 h-4 text-yellow-600" />
                      Skipped
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.skipped}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Failed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.failed}</div>
                  </CardContent>
                </Card>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="p-4 space-y-3">
                  {Array.from(analysisResults.entries()).map(([citationId, result]) => {
                    const citation = citations.find(c => c.id === citationId)
                    if (!citation) return null

                    const getStatusIcon = () => {
                      switch (result.status) {
                        case 'completed':
                          return <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
                        case 'failed':
                          return <XCircle className="w-5 h-5 text-red-600" weight="fill" />
                        case 'skipped':
                          return <Warning className="w-5 h-5 text-yellow-600" weight="fill" />
                        default:
                          return <Sparkle className="w-5 h-5 text-primary" />
                      }
                    }

                    return (
                      <Card key={citationId}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            {getStatusIcon()}
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm line-clamp-1">
                                {citation.title}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {citation.canonicalCitation}
                              </CardDescription>
                            </div>
                            {result.confidence && (
                              <Badge
                                variant={result.confidence === 'high' ? 'default' : 'secondary'}
                                className="shrink-0"
                              >
                                {result.confidence}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {result.status === 'completed' && result.suggestedTags.length > 0 && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold">Suggested Tags</Label>
                                <div className="flex flex-wrap gap-1">
                                  {result.suggestedTags.map((tag) => {
                                    const tagDef = allTags.find(t => t.name === tag)
                                    return (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        style={{
                                          borderColor: tagDef?.color,
                                          color: tagDef?.color,
                                        }}
                                      >
                                        {tag}
                                      </Badge>
                                    )
                                  })}
                                </div>
                              </div>

                              {result.reasoning && (
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold">Analysis Reasoning</Label>
                                  <p className="text-xs text-muted-foreground">{result.reasoning}</p>
                                </div>
                              )}

                              {(result.legalConcepts.length > 0 || result.practiceAreas.length > 0 || result.constitutionalIssues.length > 0) && (
                                <div className="p-2 bg-muted/50 rounded space-y-2 text-xs">
                                  {result.legalConcepts.length > 0 && (
                                    <div>
                                      <span className="font-medium">Legal Concepts: </span>
                                      <span className="text-muted-foreground">{result.legalConcepts.join(', ')}</span>
                                    </div>
                                  )}
                                  {result.practiceAreas.length > 0 && (
                                    <div>
                                      <span className="font-medium">Practice Areas: </span>
                                      <span className="text-muted-foreground">{result.practiceAreas.join(', ')}</span>
                                    </div>
                                  )}
                                  {result.constitutionalIssues.length > 0 && (
                                    <div>
                                      <span className="font-medium">Constitutional: </span>
                                      <span className="text-muted-foreground">{result.constitutionalIssues.join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleApplyResult(citationId)}
                              >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Apply Tags
                              </Button>
                            </>
                          )}

                          {result.status === 'skipped' && (
                            <p className="text-xs text-muted-foreground">{result.reasoning}</p>
                          )}

                          {result.status === 'failed' && (
                            <p className="text-xs text-destructive">{result.error}</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          {!showResults ? (
            <>
              {!isRunning && !isPaused && (
                <>
                  <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
                    Cancel
                  </Button>
                  <Button onClick={handleStart} className="flex-1 sm:flex-initial">
                    <Play className="w-4 h-4 mr-2" />
                    Start Analysis
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleExportResults}>
                <DownloadSimple className="w-4 h-4 mr-2" />
                Export Results
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
