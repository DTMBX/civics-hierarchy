export type AuthorityLevel = 'federal' | 'state' | 'territory' | 'local'

export type DocumentType = 
  | 'constitution' 
  | 'statute' 
  | 'regulation' 
  | 'treaty' 
  | 'ordinance'
  | 'organic-act'

export type VerificationStatus = 'unverified' | 'verified' | 'official'

export type UserRole = 'reader' | 'contributor' | 'curator' | 'admin'

export interface Jurisdiction {
  id: string
  name: string
  type: 'federal' | 'state' | 'territory' | 'county' | 'municipality'
  abbreviation?: string
  parentId?: string
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
