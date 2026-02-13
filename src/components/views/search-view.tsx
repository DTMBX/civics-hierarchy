import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react'
import { Section, Document, AuthorityLevel } from '@/lib/types'
import { AuthorityBadge } from '../authority-badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface SearchViewProps {
  documents: Document[]
  sections: Section[]
  onSectionSelect: (section: Section) => void
}

export function SearchView({ documents, sections, onSectionSelect }: SearchViewProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ section: Section; document: Document }[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [filters, setFilters] = useState<{
    authorityLevels: AuthorityLevel[]
  }>({
    authorityLevels: []
  })

  const handleSearch = () => {
    if (!query.trim()) return

    const searchTerm = query.toLowerCase()
    const filtered = sections.filter(section => {
      const doc = documents.find(d => d.id === section.documentId)
      if (!doc) return false

      if (filters.authorityLevels.length > 0) {
        if (!filters.authorityLevels.includes(doc.authorityLevel)) {
          return false
        }
      }

      return (
        section.title.toLowerCase().includes(searchTerm) ||
        section.text.toLowerCase().includes(searchTerm) ||
        section.canonicalCitation.toLowerCase().includes(searchTerm)
      )
    })

    const resultsWithDocs = filtered.map(section => ({
      section,
      document: documents.find(d => d.id === section.documentId)!
    }))

    setResults(resultsWithDocs)
    setHasSearched(true)
  }

  const toggleAuthorityFilter = (level: AuthorityLevel) => {
    setFilters(prev => ({
      ...prev,
      authorityLevels: prev.authorityLevels.includes(level)
        ? prev.authorityLevels.filter(l => l !== level)
        : [...prev.authorityLevels, level]
    }))
  }

  const getSnippet = (text: string, query: string) => {
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)
    
    if (index === -1) return text.slice(0, 150) + '...'
    
    const start = Math.max(0, index - 50)
    const end = Math.min(text.length, index + query.length + 100)
    const snippet = text.slice(start, end)
    
    return (start > 0 ? '...' : '') + snippet + (end < text.length ? '...' : '')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Search Legal Sources</h2>
        <p className="text-muted-foreground mt-1">
          Search across constitutional documents and statutes
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search for provisions, amendments, clauses..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Funnel size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Authority Level</Label>
                <div className="space-y-2">
                  {(['federal', 'state', 'territory', 'local'] as AuthorityLevel[]).map(level => (
                    <div key={level} className="flex items-center gap-2">
                      <Checkbox
                        id={`filter-${level}`}
                        checked={filters.authorityLevels.includes(level)}
                        onCheckedChange={() => toggleAuthorityFilter(level)}
                      />
                      <Label htmlFor={`filter-${level}`} className="capitalize cursor-pointer">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {filters.authorityLevels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {filters.authorityLevels.map(level => (
            <Badge
              key={level}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleAuthorityFilter(level)}
            >
              {level} ×
            </Badge>
          ))}
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No results found. Try adjusting your search terms or filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map(({ section, document }) => (
                <Card
                  key={section.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => onSectionSelect(section)}
                >
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold leading-tight mb-1">
                          {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {document.title}
                        </p>
                      </div>
                      <AuthorityBadge level={document.authorityLevel} />
                    </div>
                    <p className="text-sm font-serif leading-relaxed border-l-2 border-primary/30 pl-3">
                      {getSnippet(section.text, query)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {section.canonicalCitation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center space-y-2">
            <MagnifyingGlass size={48} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Enter a search term to find relevant constitutional provisions and statutes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
