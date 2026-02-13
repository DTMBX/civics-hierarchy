import { useState, useEffect, useMemo } from 'react'
import { SavedCitation, Section, Document, DocumentType, AuthorityLevel } from '@/lib/types'
import { TagDefinition } from '@/components/tag-manager'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Sparkle, Check, X, Lightbulb } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SmartTagSuggestionsProps {
  citation: SavedCitation
  section: Section | undefined
  document: Document | undefined
  allTags: TagDefinition[]
  currentTags: string[]
  onApplySuggestion: (tagName: string) => void
  onDismissSuggestion: (tagName: string) => void
}

interface TagSuggestion {
  tagName: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
  tagDef: TagDefinition | undefined
}

const CONSTITUTIONAL_KEYWORDS = {
  'Commerce Clause': ['commerce', 'interstate', 'trade', 'regulation of commerce', 'among the several states'],
  'Due Process': ['due process', 'liberty', 'property', 'life, liberty', 'deprivation', 'procedural', 'substantive'],
  'Equal Protection': ['equal protection', 'discrimination', 'classification', 'suspect class', 'rational basis', 'strict scrutiny'],
  'First Amendment': ['speech', 'religion', 'press', 'assembly', 'petition', 'establishment', 'free exercise', 'expression'],
  'Supremacy Clause': ['supremacy', 'supreme law', 'preemption', 'preempt', 'conflict', 'binding'],
  'Tenth Amendment': ['reserved', 'powers not delegated', 'states respectively', 'enumerated powers'],
  'Necessary and Proper': ['necessary and proper', 'elastic clause', 'implied powers', 'carry into execution'],
  'Fourth Amendment': ['search', 'seizure', 'warrant', 'probable cause', 'unreasonable', 'privacy'],
  'Fifth Amendment': ['self-incrimination', 'double jeopardy', 'grand jury', 'takings', 'just compensation'],
  'Fourteenth Amendment': ['citizenship', 'privileges or immunities', 'incorporation', 'state action'],
}

const TOPIC_KEYWORDS = {
  'Federalism': ['federalism', 'federal', 'state power', 'division of power', 'dual sovereignty', 'cooperative'],
  'Preemption': ['preemption', 'preempt', 'supersede', 'conflict', 'field preemption', 'express preemption', 'implied'],
  'Separation of Powers': ['separation', 'executive', 'legislative', 'judicial', 'checks and balances', 'branches'],
  'Statutory Interpretation': ['interpretation', 'construe', 'legislative intent', 'plain meaning', 'ambiguous'],
  'Administrative Law': ['agency', 'regulation', 'administrative', 'rulemaking', 'chevron', 'deference'],
  'Civil Rights': ['civil rights', 'rights', 'discrimination', 'voting', 'access', 'equality'],
  'Criminal Law': ['criminal', 'prosecution', 'defendant', 'crime', 'offense', 'punishment', 'sentencing'],
  'Constitutional Law': ['constitutional', 'unconstitutional', 'constitutionality', 'fundamental right'],
}

const PRACTICE_AREA_KEYWORDS = {
  'Immigration': ['immigration', 'alien', 'naturalization', 'visa', 'deportation', 'citizenship'],
  'Environmental': ['environment', 'pollution', 'clean air', 'clean water', 'epa', 'endangered'],
  'Employment': ['employment', 'labor', 'workplace', 'employee', 'employer', 'discrimination', 'wages'],
  'Education': ['education', 'school', 'student', 'university', 'college', 'educational institution'],
  'Healthcare': ['health', 'medical', 'healthcare', 'patient', 'hospital', 'medicaid', 'medicare'],
  'Housing': ['housing', 'landlord', 'tenant', 'rent', 'eviction', 'zoning', 'residential'],
}

export function SmartTagSuggestions({
  citation,
  section,
  document,
  allTags,
  currentTags,
  onApplySuggestion,
  onDismissSuggestion,
}: SmartTagSuggestionsProps) {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    setIsAnalyzing(true)
    const timer = setTimeout(() => setIsAnalyzing(false), 300)
    return () => clearTimeout(timer)
  }, [citation.id, section?.id])

  const suggestions = useMemo((): TagSuggestion[] => {
    if (!section && !document) return []

    const suggestedTags: TagSuggestion[] = []
    const alreadyApplied = new Set(currentTags)
    
    const contentToAnalyze = [
      citation.title,
      citation.canonicalCitation,
      citation.notes,
      section?.title || '',
      section?.text || '',
      document?.title || '',
      document?.description || '',
    ].join(' ').toLowerCase()

    const authorityLevel = document?.authorityLevel
    const documentType = document?.type

    if (authorityLevel) {
      const levelTagName = authorityLevel.charAt(0).toUpperCase() + authorityLevel.slice(1)
      const levelTag = allTags.find(t => t.name === levelTagName && t.category === 'authority-level')
      if (levelTag && !alreadyApplied.has(levelTag.name) && !dismissedSuggestions.has(levelTag.name)) {
        suggestedTags.push({
          tagName: levelTag.name,
          confidence: 'high',
          reason: `Document is at the ${authorityLevel} authority level`,
          tagDef: levelTag,
        })
      }
    }

    if (documentType === 'constitution') {
      const constitutionalTag = allTags.find(t => t.name === 'Constitutional Law')
      if (constitutionalTag && !alreadyApplied.has(constitutionalTag.name) && !dismissedSuggestions.has(constitutionalTag.name)) {
        suggestedTags.push({
          tagName: constitutionalTag.name,
          confidence: 'high',
          reason: 'This is a constitutional provision',
          tagDef: constitutionalTag,
        })
      }
    }

    Object.entries(CONSTITUTIONAL_KEYWORDS).forEach(([tagName, keywords]) => {
      const tag = allTags.find(t => t.name === tagName && t.category === 'constitutional-provision')
      if (!tag || alreadyApplied.has(tag.name) || dismissedSuggestions.has(tag.name)) return

      const matchedKeywords = keywords.filter(keyword => contentToAnalyze.includes(keyword.toLowerCase()))
      if (matchedKeywords.length > 0) {
        const confidence = matchedKeywords.length >= 2 ? 'high' : matchedKeywords.length === 1 ? 'medium' : 'low'
        suggestedTags.push({
          tagName: tag.name,
          confidence,
          reason: `Content mentions: "${matchedKeywords[0]}"`,
          tagDef: tag,
        })
      }
    })

    Object.entries(TOPIC_KEYWORDS).forEach(([tagName, keywords]) => {
      const tag = allTags.find(t => t.name === tagName && t.category === 'legal-topic')
      if (!tag || alreadyApplied.has(tag.name) || dismissedSuggestions.has(tag.name)) return

      const matchedKeywords = keywords.filter(keyword => contentToAnalyze.includes(keyword.toLowerCase()))
      if (matchedKeywords.length > 0) {
        const confidence = matchedKeywords.length >= 2 ? 'high' : matchedKeywords.length === 1 ? 'medium' : 'low'
        suggestedTags.push({
          tagName: tag.name,
          confidence,
          reason: `Topic detected: "${matchedKeywords[0]}"`,
          tagDef: tag,
        })
      }
    })

    Object.entries(PRACTICE_AREA_KEYWORDS).forEach(([tagName, keywords]) => {
      const tag = allTags.find(t => t.name === tagName && t.category === 'practice-area')
      if (!tag || alreadyApplied.has(tag.name) || dismissedSuggestions.has(tag.name)) return

      const matchedKeywords = keywords.filter(keyword => contentToAnalyze.includes(keyword.toLowerCase()))
      if (matchedKeywords.length > 0) {
        const confidence = matchedKeywords.length >= 2 ? 'high' : 'medium'
        suggestedTags.push({
          tagName: tag.name,
          confidence,
          reason: `Practice area: "${matchedKeywords[0]}"`,
          tagDef: tag,
        })
      }
    })

    const caseTypePatterns = {
      'Constitutional Challenge': ['unconstitutional', 'facial challenge', 'as-applied', 'invalidate'],
      'Preemption Dispute': ['preemption', 'preempt', 'conflict', 'supersede'],
      'Civil Litigation': ['plaintiff', 'defendant', 'civil action', 'damages'],
      'Injunctive Relief': ['injunction', 'preliminary', 'permanent', 'restraining order', 'enjoin'],
      'Administrative Appeal': ['agency decision', 'administrative review', 'appeal', 'hearing'],
    }

    Object.entries(caseTypePatterns).forEach(([tagName, keywords]) => {
      const tag = allTags.find(t => t.name === tagName && t.category === 'case-type')
      if (!tag || alreadyApplied.has(tag.name) || dismissedSuggestions.has(tag.name)) return

      const matchedKeywords = keywords.filter(keyword => contentToAnalyze.includes(keyword.toLowerCase()))
      if (matchedKeywords.length > 0) {
        suggestedTags.push({
          tagName: tag.name,
          confidence: 'medium',
          reason: `Case type indicator: "${matchedKeywords[0]}"`,
          tagDef: tag,
        })
      }
    })

    return suggestedTags
      .sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 }
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
      })
      .slice(0, 8)
  }, [section, document, citation, allTags, currentTags, dismissedSuggestions])

  const handleApply = (tagName: string) => {
    onApplySuggestion(tagName)
    toast.success(`Applied tag: ${tagName}`)
  }

  const handleDismiss = (tagName: string) => {
    setDismissedSuggestions(prev => new Set(prev).add(tagName))
    onDismissSuggestion(tagName)
  }

  if (isAnalyzing) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkle className="w-4 h-4 animate-pulse" />
            <span>Analyzing citation content...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-primary" weight="fill" />
          <div className="flex-1">
            <CardTitle className="text-base">Smart Tag Suggestions</CardTitle>
            <CardDescription className="text-xs">
              AI-powered recommendations based on content analysis
            </CardDescription>
          </div>
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.tagName}
              className="flex items-start gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs font-medium"
                    style={{
                      borderColor: suggestion.tagDef?.color,
                      color: suggestion.tagDef?.color,
                    }}
                  >
                    {suggestion.tagName}
                  </Badge>
                  {suggestion.confidence === 'high' && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      High confidence
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {suggestion.reason}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleApply(suggestion.tagName)}
                  title="Apply this tag"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDismiss(suggestion.tagName)}
                  title="Dismiss suggestion"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {suggestions.length > 0 && (
          <>
            <Separator />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8"
                onClick={() => {
                  suggestions.forEach(s => handleApply(s.tagName))
                }}
              >
                <Check className="w-3 h-3 mr-1" />
                Apply All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 h-8"
                onClick={() => {
                  suggestions.forEach(s => handleDismiss(s.tagName))
                }}
              >
                <X className="w-3 h-3 mr-1" />
                Dismiss All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
