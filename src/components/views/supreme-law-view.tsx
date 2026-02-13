import { useState } from 'react'
import { Document, Section, Jurisdiction } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  MagnifyingGlass, 
  Scales, 
  GlobeHemisphereWest, 
  SealCheck,
  BookBookmark,
  ArrowRight
} from '@phosphor-icons/react'

interface SupremeLawViewProps {
  documents: Document[]
  sections: Section[]
  onSectionSelect: (section: Section) => void
  onNavigateToTreaties?: () => void
}

export function SupremeLawView({
  documents,
  sections,
  onSectionSelect,
  onNavigateToTreaties
}: SupremeLawViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const usConstitution = documents.find(d => d.id === 'us-constitution')
  const amendments = sections.filter(s => 
    s.documentId === 'us-constitution' && s.number.includes('Amendment')
  )
  const articles = sections.filter(s => 
    s.documentId === 'us-constitution' && s.number.startsWith('Article')
  )

  const keyFederalDocs = documents.filter(d => 
    d.authorityLevel === 'federal' && 
    (d.type === 'statute' || d.type === 'treaty') &&
    d.id !== 'us-constitution'
  )

  const filteredArticles = searchQuery
    ? articles.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles

  const filteredAmendments = searchQuery
    ? amendments.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : amendments

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Supreme Law of the Land</h1>
        <p className="text-muted-foreground">
          U.S. Constitution, Amendments, and Federal Authority Sources
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Scales className="text-primary" size={32} weight="fill" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-serif">The Supremacy Clause</CardTitle>
              <CardDescription className="mt-2 text-base">
                "This Constitution, and the Laws of the United States which shall be made in Pursuance thereof;
                and all Treaties made, or which shall be made, under the Authority of the United States,
                shall be the supreme Law of the Land..."
              </CardDescription>
              <div className="mt-3">
                <Badge variant="secondary" className="font-mono text-xs">
                  U.S. Const. art. VI, cl. 2
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="relative">
        <MagnifyingGlass 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={20}
        />
        <Input
          placeholder="Search within U.S. Constitution..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="constitution" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="constitution">Constitution</TabsTrigger>
          <TabsTrigger value="amendments">Amendments</TabsTrigger>
          <TabsTrigger value="federal">Federal Authority</TabsTrigger>
        </TabsList>

        <TabsContent value="constitution" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold font-serif">Articles of the Constitution</h2>
              <p className="text-sm text-muted-foreground mt-1">
                The foundational structure of U.S. government
              </p>
            </div>
            <Badge variant="outline">
              <SealCheck className="mr-1" size={14} weight="fill" />
              Official
            </Badge>
          </div>

          <div className="grid gap-3">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onSectionSelect(article)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base font-serif">{article.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {article.text.substring(0, 150)}...
                      </CardDescription>
                    </div>
                    <ArrowRight className="flex-shrink-0 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {article.canonicalCitation}
                    </code>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No articles match your search.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="amendments" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold font-serif">Constitutional Amendments</h2>
              <p className="text-sm text-muted-foreground mt-1">
                27 amendments protecting rights and refining governance
              </p>
            </div>
            <Badge variant="outline">
              <SealCheck className="mr-1" size={14} weight="fill" />
              Official
            </Badge>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="grid gap-3 pr-4">
              {filteredAmendments.map((amendment) => (
                <Card
                  key={amendment.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => onSectionSelect(amendment)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-base font-serif">{amendment.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {amendment.text.substring(0, 150)}...
                        </CardDescription>
                      </div>
                      <ArrowRight className="flex-shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-2">
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {amendment.canonicalCitation}
                      </code>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {filteredAmendments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No amendments match your search.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="federal" className="space-y-4 mt-6">
          <div>
            <h2 className="text-xl font-semibold font-serif">Federal Authority Sources</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Key federal statutes and treaties under U.S. authority
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <BookBookmark className="text-primary" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Federal Statutes</CardTitle>
                    <CardDescription>U.S. Code provisions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {keyFederalDocs
                  .filter(d => d.type === 'statute')
                  .slice(0, 5)
                  .map((doc) => (
                    <Button
                      key={doc.id}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => {
                        const section = sections.find(s => s.documentId === doc.id)
                        if (section) onSectionSelect(section)
                      }}
                    >
                      <span className="truncate">{doc.title}</span>
                      <ArrowRight size={16} />
                    </Button>
                  ))}
                <Button variant="ghost" className="w-full text-primary">
                  View All Federal Statutes
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <GlobeHemisphereWest className="text-primary" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Treaties</CardTitle>
                    <CardDescription>International agreements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {keyFederalDocs
                  .filter(d => d.type === 'treaty')
                  .slice(0, 5)
                  .map((doc) => (
                    <Button
                      key={doc.id}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => {
                        const section = sections.find(s => s.documentId === doc.id)
                        if (section) onSectionSelect(section)
                      }}
                    >
                      <span className="truncate">{doc.title}</span>
                      <ArrowRight size={16} />
                    </Button>
                  ))}
                {onNavigateToTreaties && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-primary"
                    onClick={onNavigateToTreaties}
                  >
                    View Treaty Index
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Understanding Federal Authority</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Under the Supremacy Clause, federal law (Constitution, federal statutes made in pursuance thereof,
                and treaties) takes precedence over conflicting state or local law.
              </p>
              <p>
                Federal authority is limited to powers enumerated in the Constitution and those necessary
                and proper to execute those powers.
              </p>
              <Button variant="link" className="px-0 h-auto text-primary">
                Learn more about Federal Supremacy →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
