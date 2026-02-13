import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AuthorityBadge, VerificationBadge } from '../authority-badge'
import { Document, Section, AuthorityLevel } from '@/lib/types'
import { BookOpen, ArrowRight } from '@phosphor-icons/react'

interface LibraryViewProps {
  documents: Document[]
  sections: Section[]
  selectedJurisdictionId?: string
  onDocumentSelect: (documentId: string) => void
  onSectionSelect: (section: Section) => void
}

export function LibraryView({
  documents,
  sections,
  selectedJurisdictionId,
  onDocumentSelect,
  onSectionSelect
}: LibraryViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<AuthorityLevel | 'all'>('all')

  const filteredDocuments = documents.filter(doc => {
    if (selectedLevel !== 'all' && doc.authorityLevel !== selectedLevel) {
      return false
    }
    if (selectedJurisdictionId) {
      return doc.jurisdictionId === 'us-federal' || doc.jurisdictionId === selectedJurisdictionId
    }
    return doc.jurisdictionId === 'us-federal'
  })

  const federalDocs = filteredDocuments.filter(d => d.authorityLevel === 'federal')
  const stateDocs = filteredDocuments.filter(d => d.authorityLevel === 'state')
  const territoryDocs = filteredDocuments.filter(d => d.authorityLevel === 'territory')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Constitutional Library</h2>
        <p className="text-muted-foreground mt-1">
          Browse authoritative constitutional documents and legal sources
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedLevel === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedLevel('all')}
        >
          All Levels
        </Badge>
        <Badge
          variant={selectedLevel === 'federal' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedLevel('federal')}
        >
          Federal
        </Badge>
        <Badge
          variant={selectedLevel === 'state' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedLevel('state')}
        >
          State
        </Badge>
        <Badge
          variant={selectedLevel === 'territory' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedLevel('territory')}
        >
          Territory
        </Badge>
      </div>

      <div className="space-y-6">
        {federalDocs.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Federal Law
              <AuthorityBadge level="federal" />
            </h3>
            <div className="space-y-3">
              {federalDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  sections={sections.filter(s => s.documentId === doc.id)}
                  onDocumentSelect={onDocumentSelect}
                  onSectionSelect={onSectionSelect}
                />
              ))}
            </div>
          </section>
        )}

        {stateDocs.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              State Law
              <AuthorityBadge level="state" />
            </h3>
            <div className="space-y-3">
              {stateDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  sections={sections.filter(s => s.documentId === doc.id)}
                  onDocumentSelect={onDocumentSelect}
                  onSectionSelect={onSectionSelect}
                />
              ))}
            </div>
          </section>
        )}

        {territoryDocs.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Territory Law
              <AuthorityBadge level="territory" />
            </h3>
            <div className="space-y-3">
              {territoryDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  sections={sections.filter(s => s.documentId === doc.id)}
                  onDocumentSelect={onDocumentSelect}
                  onSectionSelect={onSectionSelect}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

interface DocumentCardProps {
  document: Document
  sections: Section[]
  onDocumentSelect: (documentId: string) => void
  onSectionSelect: (section: Section) => void
}

function DocumentCard({ document, sections, onDocumentSelect, onSectionSelect }: DocumentCardProps) {
  const topLevelSections = sections.filter(s => !s.parentSectionId).sort((a, b) => a.order - b.order)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{document.title}</CardTitle>
            {document.description && (
              <CardDescription>{document.description}</CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end">
            <AuthorityBadge level={document.authorityLevel} />
            <VerificationBadge status={document.verificationStatus} />
          </div>
        </div>
        {document.effectiveDate && (
          <p className="text-xs text-muted-foreground">
            Effective: {new Date(document.effectiveDate).toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      {topLevelSections.length > 0 && (
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sections">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  View Sections ({topLevelSections.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-1 pr-4">
                    {topLevelSections.map(section => (
                      <Button
                        key={section.id}
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-2 px-3"
                        onClick={() => onSectionSelect(section)}
                      >
                        <span className="font-medium mr-2">{section.number}</span>
                        <span className="truncate flex-1 text-left">{section.title}</span>
                        <ArrowRight size={14} className="ml-2 flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  )
}
