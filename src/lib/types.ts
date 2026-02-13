export type AuthorityLevel = 'federal' | 'state' | 'territory' | 'local'

export type DocumentType = 
  | 'constitution' 
  | 'statute' 
  | 'regulation' 
  | 'treaty' 
  | 'ordinance'
  | 'organic-act'
  | 'amendment'
  | 'code'

export type VerificationStatus = 'unverified' | 'verified' | 'official'

export type UserRole = 'reader' | 'contributor' | 'curator' | 'admin'

export type CitationStyle = 
  | 'bluebook'
  | 'alwd'
  | 'apa'
  | 'mla'
  | 'chicago'
  | 'plain'
  | 'court-filing'
  | 'bibtex'
  | 'json'

export type AuditAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'verify'
  | 'export'
  | 'submit'
  | 'flag'
  | 'acknowledge'

export type EntityType =
  | 'application'
  | 'document'
  | 'section'
  | 'bookmark'
  | 'citation'
  | 'note'
  | 'submission'
  | 'disclaimer'
  | 'collection'

export interface Jurisdiction {
  id: string
  name: string
  type: 'federal' | 'state' | 'territory' | 'county' | 'municipality'
  abbreviation?: string
  parentId?: string
}

export interface SourceRegistryEntry {
  id: string
  officialUrl: string
  publisher: string
  retrievalMethod: 'manual' | 'api' | 'scrape' | 'certified-copy'
  retrievedAt: string
  checksum?: string
  isOfficialSource: boolean
  mirrorUrl?: string
  curatorJustification?: string
}

export interface VersionSnapshot {
  id: string
  documentId: string
  effectiveStart: string
  effectiveEnd?: string
  content: string
  sourceRegistryId: string
  checksum: string
  createdAt: string
  createdBy: string
  notes?: string
}

export interface Document {
  id: string
  title: string
  type: DocumentType
  authorityLevel: AuthorityLevel
  jurisdictionId: string
  effectiveDate?: string
  supersededDate?: string
  verificationStatus: VerificationStatus
  sourceUrl?: string
  lastChecked?: string
  description?: string
  sourceRegistryIds?: string[]
  currentVersionId?: string
  retrievalMetadata?: {
    retrievedAt: string
    sourceUrl: string
    checksum: string
    parsingMethod: string
  }
}

export interface Section {
  id: string
  documentId: string
  title: string
  number: string
  text: string
  canonicalCitation: string
  parentSectionId?: string
  order: number
}

export interface Citation {
  id: string
  documentId: string
  sectionId?: string
  canonical: string
  url?: string
  format: 'bluebook' | 'plain' | 'url'
}

export interface UserNote {
  id: string
  sectionId: string
  content: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: string
  sectionId: string
  documentId: string
  createdAt: string
  note?: string
}

export interface AnalyzerSession {
  id: string
  createdAt: string
  title: string
  questions: Record<string, string>
  report?: AnalyzerReport
}

export interface AnalyzerReport {
  relevantProvisions: {
    sectionId: string
    citation: string
    snippet: string
    authorityLevel: AuthorityLevel
  }[]
  preemptionCategories: string[]
  keyQuestions: string[]
  nextSteps: string[]
  disclaimer: string
}

export interface LocalSubmission {
  id: string
  documentTitle: string
  jurisdictionId: string
  sourceUrl: string
  uploadedFile?: string
  submittedBy: string
  submittedAt: string
  verificationStatus: VerificationStatus
  curatorNotes?: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface UserSettings {
  selectedJurisdictionId: string
  secondaryJurisdictionIds: string[]
  offlinePacks: string[]
  analyticsOptIn: boolean
  fontSize: 'small' | 'medium' | 'large'
}

export interface SavedCitation {
  id: string
  sectionId: string
  documentId: string
  jurisdictionId: string
  title: string
  canonicalCitation: string
  tags: string[]
  notes: string
  collections: string[]
  createdAt: string
  updatedAt: string
  accessCount: number
  lastAccessed?: string
  isFavorite: boolean
}

export interface CitationCollection {
  id: string
  name: string
  description: string
  citationIds: string[]
  color: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export interface CrossReference {
  id: string
  fromSectionId: string
  toSectionId: string
  relationshipType: 'supersedes' | 'implements' | 'references' | 'conflicts' | 'preempts'
  notes?: string
}

export interface TopicTag {
  id: string
  name: string
  category: 'constitutional' | 'legal-topic' | 'practice-area' | 'case-type' | 'jurisdiction' | 'custom'
  description?: string
  usageCount: number
}

export interface ExplanationArticle {
  id: string
  title: string
  content: string
  relatedSectionIds: string[]
  citations: string[]
  authorRole: UserRole
  createdAt: string
  updatedAt: string
  reviewedBy?: string
  isPublished: boolean
}

export interface ProvenancePanel {
  sourceRegistryEntry: SourceRegistryEntry
  versionSnapshot?: VersionSnapshot
  retrievalMetadata: {
    retrievedAt: string
    sourceUrl: string
    checksum: string
    parsingMethod: string
  }
  verificationChain: {
    verifiedBy: string
    verifiedAt: string
    method: string
    notes: string
  }[]
}

export interface UpdateStrategy {
  documentId: string
  refreshSchedule: string
  lastSuccessfulRefresh: string
  lastAttemptedRefresh: string
  failureCount: number
  isStale: boolean
  staleWarningThreshold: number
}

export interface CompareView {
  leftSection: Section
  rightSection: Section
  similarities: string[]
  differences: string[]
  neutralSummary: string
  disclaimerText: string
}

export interface TreatyMetadata {
  id: string
  documentId: string
  ratificationDate?: string
  status: 'pending' | 'ratified' | 'terminated' | 'suspended'
  implementingLegislation?: string[]
  signatories: string[]
  reservations?: string
}

export interface SmartTagSuggestion {
  tagName: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
  category: TopicTag['category']
  autoApplied: boolean
}

export interface BatchAnalysisJob {
  id: string
  citationIds: string[]
  startedAt: string
  completedAt?: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  progress: {
    total: number
    completed: number
    failed: number
    skipped: number
  }
  results: BatchAnalysisResult[]
  options: {
    autoApplyHighConfidence: boolean
    skipThreshold: number
    analysisMode: 'deep' | 'quick'
  }
}

export interface BatchAnalysisResult {
  citationId: string
  status: 'analyzing' | 'completed' | 'failed' | 'skipped'
  suggestions: SmartTagSuggestion[]
  error?: string
  processingTime: number
  legalConcepts: string[]
  practiceAreas: string[]
  constitutionalIssues: string[]
}
