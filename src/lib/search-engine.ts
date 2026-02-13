import { Section, Document, AuthorityLevel, DocumentType } from './types'

export interface SearchResult {
  section: Section
  document: Document
  relevanceScore: number
  matchedText: string
  matchPosition: number
}

export interface SearchFilters {
  authorityLevels?: AuthorityLevel[]
  documentTypes?: DocumentType[]
  jurisdictionIds?: string[]
  effectiveDateFrom?: string
  effectiveDateTo?: string
}

export class FullTextSearchEngine {
  private sections: Section[]
  private documents: Document[]
  private sectionIndex: Map<string, Section>
  private documentIndex: Map<string, Document>

  constructor(sections: Section[], documents: Document[]) {
    this.sections = sections
    this.documents = documents
    this.sectionIndex = new Map(sections.map(s => [s.id, s]))
    this.documentIndex = new Map(documents.map(d => [d.id, d]))
  }

  search(query: string, filters?: SearchFilters, limit: number = 50): SearchResult[] {
    if (!query.trim()) return []

    const queryTerms = this.tokenize(query.toLowerCase())
    const results: SearchResult[] = []

    for (const section of this.sections) {
      const document = this.documentIndex.get(section.documentId)
      if (!document) continue

      if (filters && !this.matchesFilters(document, filters)) continue

      const searchableText = `${section.title} ${section.text} ${section.canonicalCitation}`.toLowerCase()
      const score = this.calculateRelevance(searchableText, queryTerms)

      if (score > 0) {
        const matchPosition = searchableText.indexOf(queryTerms[0])
        const matchedText = this.extractMatchSnippet(section.text, query, 150)

        results.push({
          section,
          document,
          relevanceScore: score,
          matchedText,
          matchPosition
        })
      }
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
  }

  searchByDocument(query: string, documentId: string, limit: number = 20): SearchResult[] {
    const queryTerms = this.tokenize(query.toLowerCase())
    const results: SearchResult[] = []

    const document = this.documentIndex.get(documentId)
    if (!document) return []

    for (const section of this.sections) {
      if (section.documentId !== documentId) continue

      const searchableText = `${section.title} ${section.text} ${section.canonicalCitation}`.toLowerCase()
      const score = this.calculateRelevance(searchableText, queryTerms)

      if (score > 0) {
        const matchPosition = searchableText.indexOf(queryTerms[0])
        const matchedText = this.extractMatchSnippet(section.text, query, 150)

        results.push({
          section,
          document,
          relevanceScore: score,
          matchedText,
          matchPosition
        })
      }
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
  }

  private calculateRelevance(text: string, queryTerms: string[]): number {
    let score = 0
    const words = text.split(/\s+/)

    for (const term of queryTerms) {
      const exactMatches = (text.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length
      const partialMatches = (text.match(new RegExp(term, 'g')) || []).length - exactMatches

      score += exactMatches * 10
      score += partialMatches * 3

      if (text.startsWith(term)) score += 5
    }

    const allTermsPresent = queryTerms.every(term => text.includes(term))
    if (allTermsPresent && queryTerms.length > 1) {
      score += 20
    }

    return score
  }

  private extractMatchSnippet(text: string, query: string, maxLength: number): string {
    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()
    const matchIndex = textLower.indexOf(queryLower.split(' ')[0])

    if (matchIndex === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '')
    }

    const start = Math.max(0, matchIndex - Math.floor(maxLength / 2))
    const end = Math.min(text.length, start + maxLength)
    
    let snippet = text.substring(start, end)
    
    if (start > 0) snippet = '...' + snippet
    if (end < text.length) snippet = snippet + '...'

    return snippet
  }

  private matchesFilters(document: Document, filters: SearchFilters): boolean {
    if (filters.authorityLevels && !filters.authorityLevels.includes(document.authorityLevel)) {
      return false
    }

    if (filters.documentTypes && !filters.documentTypes.includes(document.type)) {
      return false
    }

    if (filters.jurisdictionIds && !filters.jurisdictionIds.includes(document.jurisdictionId)) {
      return false
    }

    if (filters.effectiveDateFrom && document.effectiveDate) {
      if (document.effectiveDate < filters.effectiveDateFrom) return false
    }

    if (filters.effectiveDateTo && document.effectiveDate) {
      if (document.effectiveDate > filters.effectiveDateTo) return false
    }

    return true
  }

  getDocumentsByJurisdiction(jurisdictionId: string): Document[] {
    return this.documents.filter(d => d.jurisdictionId === jurisdictionId)
  }

  getDocumentsByType(type: DocumentType): Document[] {
    return this.documents.filter(d => d.type === type)
  }

  getSectionsByDocument(documentId: string): Section[] {
    return this.sections.filter(s => s.documentId === documentId)
  }
}
