import { useState, useEffect } from 'react'
import { TagDefinition } from '@/components/tag-manager'
import { TagDefinition } from '@/components/tag-manager'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/compo
import { Switch } fr
import { ScrollArea } from '@/c
import { Card, CardHeader, CardTitle, CardConte
import { 
  CheckCircle, 
  Warning, 
  Play,
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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

  citationId: string
  suggestedTags
  reasoning?: string
  practiceAreas: string[]
  error?: string
}
interface LLMAnalysisResul
  legalConcepts: string[]
}

interface AnalysisResult {
  citationId: string
  status: 'analyzing' | 'completed' | 'failed' | 'skipped'
  suggestedTags: string[]
  confidence?: 'high' | 'medium' | 'low'
  reasoning?: string
  legalConcepts: string[]
  practiceAreas: string[]
  constitutionalIssues: string[]
  error?: string
  processingTime: number
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
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [skipAlreadyTagged, setSkipAlreadyTagged] = useState(true)
  const [autoApplyHighConfidence, setAutoApplyHighConfidence] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<Map<string, AnalysisResult>>(new Map())

  useEffect(() => {
    if (open) {
      setSelectedCitations(new Set(citations.map(c => c.id)))
      setCurrentIndex(0)
      setIsRunning(false)
      setIsPaused(false)
      setShowResults(false)
      setAnalysisResults(new Map())
    }
  }, [open, citations])

  const selectedCitationsList = citations.filter(c => selectedCitations.has(c.id))
  const totalSelected = selectedCitationsList.length
  const completedCount = Array.from(analysisResults.values()).filter(r => r.status === 'completed').length
  const failedCount = Array.from(analysisResults.values()).filter(r => r.status === 'failed').length
  const skippedCount = Array.from(analysisResults.values()).filter(r => r.status === 'skipped').length
  const progress = totalSelected > 0 ? (currentIndex / totalSelected) * 100 : 0

  const analyzeSingleCitation = async (citation: SavedCitation): Promise<AnalysisResult> => {
    const startTime = Date.now()

    if (skipAlreadyTagged && citation.tags.length >= 3) {
      return {
      const contentToAnalyze = [
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

    try {
ANALYSIS INSTRUCTIONS:
2. Suggest 3-8 most relevant tags from the available tag list that are N

6. Assign a confidence level based
Return your anal
  "suggestedTags": ["Tag Name 1", 
  "practiceAreas": ["area1"
  "reasoning": "Brief explan

      const llmResult = 
      const newTags = llmRes
      )
      const confidence: 'high' | 'm
          ? 'high'
          ? 'medium'

       

        reasoning: llmResult.rea
        practiceAreas: llmResult.pr
        processingTime: Date.now() - startTime,
    } catch (error) {
        citationId: citation.id,
        suggestedTags: [],
        reasoning: '',
        practiceAreas: [],
        error: error instanceof Er

  }
  const runBatchAnalysis = async () => {
    setShowResults(

    for (let i = 0; i < citationsToAnalyze.length; i++) {

      }
      const citatio

        newMap.
          

          constitutionalIssues: [],

      })
      const result = await analyzeSingleCitation(citation)
      setAnalysisResults(prev => {
        newMap.set(citation.id, result)
      })
      if (autoApplyHighConfidence && result.confid
      }


 
  }
  const toggleAllCitations = () => {
      setSelectedCitations(new Set())
      setSelectedCitations(new Set(citations.ma
  }
  

        newSet.delete(citationId)
        newSet.add(citationId)

  }
  const applyTagsToCitation = (citationId: string, tags: string[]) => {
    if 

  }
  const getStatusIcon = (result: AnalysisResult) => {
      case 'comple
      case 'failed':
      case 'skipped'
      default:


    const resultsData = Array.fr
      return {
        status: result.status,
        suggestedTa
        practiceAreas: result.practiceA
        reasoning: result.reasoning,
      }

    const dataBlob = new Blob([dataStr], { type
    con
    link.download = `
    URL.revoke
  }
  return (
      <DialogContent class
          <DialogTitle cla
            Deep Batch
          <DialogDescripti
          </DialogDescript

          {!isRunning && !showResults ? (
              <Card>
       
     
   

                      </p>
    setIsRunning(true)
                      onC
    
                  <div className="flex items-center justify-between">
    
                        Automatically apply tags with hig
      if (isPaused) {
        setIsRunning(false)
        return
       

                <CardHeader>
      
                      size="sm"
                      onClick={toggl
                      {selectedCi
                  </CardTitle>
          status: 'analyzing',
          suggestedTags: [],
          legalConcepts: [],
          practiceAreas: [],
          constitutionalIssues: [],
          processingTime: 0,
        })
        return newMap
      })

      const result = await analyzeSingleCitation(citation)
      
      setAnalysisResults(prev => {
        const newMap = new Map(prev)
        newMap.set(citation.id, result)
        return newMap
      })

      if (autoApplyHighConfidence && result.confidence === 'high' && result.suggestedTags.length > 0) {
        onApplyTags(citation.id, [...citation.tags, ...result.suggestedTags])
      }

      setCurrentIndex(currentIndex + i + 1)
    }

    setIsRunning(false)
    setShowResults(true)
    toast.success('Batch analysis completed')
  }

  const toggleAllCitations = () => {
    if (selectedCitations.size === citations.length) {
      setSelectedCitations(new Set())
    } else {
      setSelectedCitations(new Set(citations.map(c => c.id)))
    }
  }

  const toggleCitation = (citationId: string) => {
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

  const applyTagsToCitation = (citationId: string, tags: string[]) => {
    const citation = citations.find(c => c.id === citationId)
    if (citation) {
      onApplyTags(citationId, [...citation.tags, ...tags])
      toast.success('Tags applied successfully')
    }
  }

  const getStatusIcon = (result: AnalysisResult) => {
    switch (result.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />
      case 'skipped':
        return <Warning className="w-4 h-4 text-yellow-600" />
      default:
        return <Sparkle className="w-4 h-4 text-primary animate-pulse" />
    }
  }

  const exportResults = () => {
    const resultsData = Array.from(analysisResults.entries()).map(([id, result]) => {
      const citation = citations.find(c => c.id === id)
      return {
        citation: citation?.canonicalCitation,
        status: result.status,
        confidence: result.confidence,
        suggestedTags: result.suggestedTags,
        legalConcepts: result.legalConcepts,
        practiceAreas: result.practiceAreas,
        constitutionalIssues: result.constitutionalIssues,
        reasoning: result.reasoning,
        processingTime: result.processingTime,
      }
    })

    const dataStr = JSON.stringify(resultsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch-analysis-results-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Results exported')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Deep Batch Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered tag suggestions for multiple citations
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {!isRunning && !showResults ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Skip Already Tagged</p>
                      <p className="text-xs text-muted-foreground">
                        Skip citations that already have 3+ tags
                      </p>
                          
                    <Switch
                      checked={skipAlreadyTagged}
                      onCheckedChange={setSkipAlreadyTagged}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-Apply High Confidence</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically apply tags with high confidence ratings
                      </p>
                    </div>
                    <Switch
                      checked={autoApplyHighConfidence}
                      onCheckedChange={setAutoApplyHighConfidence}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Select Citations ({selectedCitations.size} selected)</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleAllCitations}
                    >
                      {selectedCitations.size === citations.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {citations.map(citation => {
                        const isSelected = selectedCitations.has(citation.id)
                        return (
                          <div
                            key={citation.id}
                            className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`citation-${citation.id}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleCitation(citation.id)}
                            />
                            <label
                              htmlFor={`citation-${citation.id}`}
                              className="flex-1 text-sm cursor-pointer"
                            >
                              <div className="font-medium">{citation.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {citation.canonicalCitation}
                              </div>
                              {citation.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {citation.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          ) : isRunning ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analysis Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Processing {currentIndex} of {totalSelected}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{skippedCount}</div>
                      <div className="text-xs text-muted-foreground">Skipped</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-destructive">{failedCount}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : showResults ? (
            <>
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Completed
                    </CardTitle>

                  <CardContent>
                    <div className="text-2xl font-bold">{completedCount}</div>
                  </CardContent>


                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Warning className="w-4 h-4 text-yellow-600" />

                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{skippedCount}</div>
                  </CardContent>


                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-destructive" />

                    </CardTitle>


                    <div className="text-2xl font-bold">{failedCount}</div>

                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Avg Time</CardTitle>
                  </CardHeader>

                    <div className="text-2xl font-bold">
                      {Array.from(analysisResults.values()).length > 0
                        ? Math.round(
                            Array.from(analysisResults.values()).reduce(
                              (sum, r) => sum + r.processingTime,
                              0
                            ) / analysisResults.size / 1000
                          )
                        : 0}s
                    </div>

                </Card>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {Array.from(analysisResults.entries()).map(([citationId, result]) => {
                    const citation = citations.find(c => c.id === citationId)
                    if (!citation) return null

                    return (

                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result)}
                                <CardTitle className="text-sm">{citation.title}</CardTitle>
                              </div>
                              <CardDescription className="text-xs mt-1">
                                {citation.canonicalCitation}

                            </div>

                              <Badge
                                variant={
                                  result.confidence === 'high'
                                    ? 'default'
                                    : result.confidence === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                                }

                                {result.confidence} confidence

                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {result.status === 'completed' && (

                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-medium mb-1">Suggested Tags:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {result.suggestedTags.map(tag => (
                                      <Badge

                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {(result.legalConcepts.length > 0 || result.practiceAreas.length > 0 || result.constitutionalIssues.length > 0) && (
                                  <div className="text-xs space-y-1 text-muted-foreground">
                                    {result.legalConcepts.length > 0 && (
                                      <div>
                                        <span className="font-medium">Legal Concepts: </span>
                                        {result.legalConcepts.join(', ')}
                                      </div>
                                    )}
                                    {result.practiceAreas.length > 0 && (
                                      <div>
                                        <span className="font-medium">Practice Areas: </span>
                                        {result.practiceAreas.join(', ')}
                                      </div>
                                    )}
                                    {result.constitutionalIssues.length > 0 && (
                                      <div>
                                        <span className="font-medium">Constitutional: </span>
                                        {result.constitutionalIssues.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {result.reasoning && (
                                  <p className="text-xs text-muted-foreground italic">
                                    {result.reasoning}
                                  </p>
                                )}

                                {result.suggestedTags.length > 0 && (
                                  <Button
                                    size="sm"
                                    onClick={() => applyTagsToCitation(citationId, result.suggestedTags)}
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    Apply Tags
                                  </Button>
                                )}

                            </>
                          )}
                          {result.status === 'skipped' && (
                            <p className="text-xs text-muted-foreground">{result.reasoning}</p>
                          )}
                          {result.status === 'failed' && (

                          )}

                      </Card>

                  })}

              </ScrollArea>
            </>
          ) : null}
        </div>


          {!showResults ? (

              {!isRunning ? (

                  <Button variant="outline" onClick={onClose}>

                  </Button>
                  <Button
                    onClick={runBatchAnalysis}
                    disabled={selectedCitations.size === 0}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Analysis
                  </Button>

              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPaused(true)
                      setIsRunning(false)
                    }}
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsRunning(false)
                      setShowResults(true)
                    }}
                  >
                    <Stop className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}

          ) : (

              <Button variant="outline" onClick={exportResults}>
                <DownloadSimple className="w-4 h-4 mr-2" />
                Export Results

              <Button onClick={onClose}>
                Close
              </Button>

          )}

      </DialogContent>

  )

