import { useState } from 'react'
import { Document, Section, TreatyMetadata } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GlobeHemisphereWest,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  XCircle,
  Pause,
  FileText,
  Info,
  ArrowRight
} from '@phosphor-icons/react'

interface TreatiesViewProps {
  documents: Document[]
  sections: Section[]
  onSectionSelect: (section: Section) => void
}

export function TreatiesView({ documents, sections, onSectionSelect }: TreatiesViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ratified' | 'pending' | 'terminated'>('all')

  const treatyDocs = documents.filter(d => d.type === 'treaty')

  const mockTreatyMetadata: Record<string, TreatyMetadata> = {
    'united-nations-charter': {
      id: 'treaty-meta-1',
      documentId: 'united-nations-charter',
      ratificationDate: '1945-10-24',
      status: 'ratified',
      signatories: ['United States', '50 other founding members'],
      implementingLegislation: ['22 U.S.C. §§ 287-287e'],
      reservations: 'U.S. participation subject to Constitutional limitations on treaty power'
    },
    'geneva-conventions': {
      id: 'treaty-meta-2',
      documentId: 'geneva-conventions',
      ratificationDate: '1955-08-02',
      status: 'ratified',
      signatories: ['United States', '194 other parties'],
      implementingLegislation: ['18 U.S.C. § 2441 (War Crimes Act)'],
    },
    'iccpr': {
      id: 'treaty-meta-3',
      documentId: 'iccpr',
      ratificationDate: '1992-06-08',
      status: 'ratified',
      signatories: ['United States', '172 other parties'],
      reservations: 'Multiple reservations, understandings, and declarations'
    },
    'vienna-convention': {
      id: 'treaty-meta-4',
      documentId: 'vienna-convention',
      ratificationDate: undefined,
      status: 'pending',
      signatories: ['United States (signed but not ratified)', '116 other parties'],
    }
  }

  const filteredTreaties = treatyDocs.filter(treaty => {
    const metadata = mockTreatyMetadata[treaty.id]
    const matchesSearch = searchQuery
      ? treaty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treaty.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesStatus = statusFilter === 'all' || metadata?.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status?: TreatyMetadata['status']) => {
    switch (status) {
      case 'ratified':
        return <CheckCircle weight="fill" className="text-green-600" />
      case 'pending':
        return <Clock weight="fill" className="text-amber-600" />
      case 'terminated':
        return <XCircle weight="fill" className="text-red-600" />
      case 'suspended':
        return <Pause weight="fill" className="text-gray-600" />
      default:
        return <FileText weight="fill" className="text-muted-foreground" />
    }
  }

  const getStatusBadge = (status?: TreatyMetadata['status']) => {
    const variants = {
      ratified: 'default',
      pending: 'secondary',
      terminated: 'destructive',
      suspended: 'outline'
    }
    return (
      <Badge variant={variants[status || 'pending'] as any}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <GlobeHemisphereWest size={32} className="text-primary" weight="fill" />
          <div>
            <h1 className="text-3xl font-bold font-serif">Treaties & International Agreements</h1>
            <p className="text-muted-foreground">
              U.S. treaty obligations and international law framework
            </p>
          </div>
        </div>
      </div>

      <Alert className="border-primary/30 bg-primary/5">
        <Info />
        <AlertDescription>
          <strong>Constitutional Framework:</strong> Under Article II, Section 2, the President makes
          treaties with the advice and consent of the Senate (two-thirds vote required). Valid treaties
          are part of the "supreme Law of the Land" under the Supremacy Clause (Art. VI, Cl. 2), but
          are subject to Constitutional limitations.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Treaties</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {treatyDocs.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs flex items-center gap-1">
              <CheckCircle size={14} weight="fill" />
              Ratified
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600">
              {Object.values(mockTreatyMetadata).filter(m => m.status === 'ratified').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs flex items-center gap-1">
              <Clock size={14} weight="fill" />
              Pending
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600">
              {Object.values(mockTreatyMetadata).filter(m => m.status === 'pending').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs flex items-center gap-1">
              <XCircle size={14} weight="fill" />
              Terminated
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-red-600">
              {Object.values(mockTreatyMetadata).filter(m => m.status === 'terminated').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <MagnifyingGlass 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <Input
            placeholder="Search treaties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ratified">Ratified</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="terminated">Terminated</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {filteredTreaties.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center text-muted-foreground">
                <GlobeHemisphereWest size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No treaties found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredTreaties.map((treaty) => {
              const metadata = mockTreatyMetadata[treaty.id]
              const treatySections = sections.filter(s => s.documentId === treaty.id)
              
              return (
                <Card
                  key={treaty.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(metadata?.status)}
                          {getStatusBadge(metadata?.status)}
                        </div>
                        
                        <div>
                          <CardTitle className="text-lg font-serif">{treaty.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {treaty.description || 'International agreement'}
                          </CardDescription>
                        </div>

                        {metadata && (
                          <div className="space-y-2 text-sm">
                            {metadata.ratificationDate && (
                              <div>
                                <span className="font-medium">Ratified:</span>{' '}
                                {new Date(metadata.ratificationDate).toLocaleDateString('en-US', {
                                  dateStyle: 'long'
                                })}
                              </div>
                            )}
                            
                            {metadata.signatories && (
                              <div>
                                <span className="font-medium">Signatories:</span>{' '}
                                <span className="text-muted-foreground">
                                  {metadata.signatories.join(', ')}
                                </span>
                              </div>
                            )}

                            {metadata.implementingLegislation && metadata.implementingLegislation.length > 0 && (
                              <div>
                                <span className="font-medium">Implementing Legislation:</span>{' '}
                                <span className="text-muted-foreground font-mono text-xs">
                                  {metadata.implementingLegislation.join(', ')}
                                </span>
                              </div>
                            )}

                            {metadata.reservations && (
                              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                                <span className="font-medium text-amber-900">Reservations:</span>{' '}
                                <span className="text-amber-700">{metadata.reservations}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {treatySections.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {treatySections.slice(0, 3).map((section) => (
                              <Button
                                key={section.id}
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onSectionSelect(section)
                                }}
                              >
                                {section.title}
                                <ArrowRight className="ml-2" size={14} />
                              </Button>
                            ))}
                            {treatySections.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{treatySections.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })
          )}
        </div>
      </ScrollArea>

      <Alert>
        <Info />
        <AlertDescription className="text-sm">
          <strong>Note:</strong> This module distinguishes between (a) treaty text, (b) ratification/status
          metadata, and (c) implementing legislation. The interaction between treaties and federal/state law
          is presented at a conceptual level. Specific case outcomes depend on judicial interpretation and are
          not asserted here.
        </AlertDescription>
      </Alert>
    </div>
  )
}
