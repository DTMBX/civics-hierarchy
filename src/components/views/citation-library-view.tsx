import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { SavedCitation, CitationCollection, Section, Document } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { BatchCitationExportDialog } from '@/components/batch-citation-export-dialog'
import { jurisdictions } from '@/lib/seed-data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  BookmarkSimple,
  MagnifyingGlass,
  Plus,
  DotsThree,
  Trash,
  FolderOpen,
  Tag,
  Star,
  Download,
  Copy,
  ShareNetwork,
  Folder,
  PencilSimple,
  SortAscending,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CitationLibraryViewProps {
  documents: Document[]
  sections: Section[]
  onSectionSelect: (section: Section) => void
}

type SortOption = 'recent' | 'alphabetical' | 'most-used' | 'favorite'

export function CitationLibraryView({ documents, sections, onSectionSelect }: CitationLibraryViewProps) {
  const [savedCitations, setSavedCitations] = useKV<SavedCitation[]>('citation-library', [])
  const [collections, setCollections] = useKV<CitationCollection[]>('citation-collections', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [showEditCitation, setShowEditCitation] = useState(false)
  const [editingCitation, setEditingCitation] = useState<SavedCitation | null>(null)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [newCollectionColor, setNewCollectionColor] = useState('#4F46E5')
  const [showBatchExport, setShowBatchExport] = useState(false)
  const [userId, setUserId] = useState<string>('anonymous')

  useState(() => {
    const getUser = async () => {
      const user = await window.spark.user()
      const userIdentifier = user?.login || String(user?.id || '') || `anonymous-${Date.now()}`
      setUserId(userIdentifier)
    }
    getUser()
  })

  const collectionColors = [
    '#4F46E5',
    '#DC2626',
    '#059669',
    '#D97706',
    '#7C3AED',
    '#DB2777',
    '#0891B2',
    '#65A30D',
  ]

  const filteredCitations = useMemo(() => {
    let filtered = savedCitations || []

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.canonicalCitation.toLowerCase().includes(query) ||
          c.notes.toLowerCase().includes(query) ||
          c.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    if (selectedCollection === 'favorites') {
      filtered = filtered.filter((c) => c.isFavorite)
    } else if (selectedCollection !== 'all') {
      filtered = filtered.filter((c) => c.collections.includes(selectedCollection))
    }

    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'most-used':
        filtered.sort((a, b) => b.accessCount - a.accessCount)
        break
      case 'favorite':
        filtered.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1))
        break
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }

    return filtered
  }, [savedCitations, searchQuery, selectedCollection, sortBy])

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error('Collection name is required')
      return
    }

    const newCollection: CitationCollection = {
      id: `collection-${Date.now()}`,
      name: newCollectionName,
      description: newCollectionDescription,
      citationIds: [],
      color: newCollectionColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
    }

    setCollections((current) => [...(current || []), newCollection])
    setNewCollectionName('')
    setNewCollectionDescription('')
    setNewCollectionColor('#4F46E5')
    setShowNewCollection(false)
    toast.success('Collection created')
  }

  const handleDeleteCollection = (collectionId: string) => {
    setCollections((current) => (current || []).filter((c) => c.id !== collectionId))
    setSavedCitations((current) =>
      (current || []).map((citation) => ({
        ...citation,
        collections: citation.collections.filter((id) => id !== collectionId),
      }))
    )
    if (selectedCollection === collectionId) {
      setSelectedCollection('all')
    }
    toast.success('Collection deleted')
  }

  const handleToggleFavorite = (citationId: string) => {
    setSavedCitations((current) =>
      (current || []).map((c) =>
        c.id === citationId
          ? { ...c, isFavorite: !c.isFavorite, updatedAt: new Date().toISOString() }
          : c
      )
    )
  }

  const handleDeleteCitation = (citationId: string) => {
    setSavedCitations((current) => (current || []).filter((c) => c.id !== citationId))
    toast.success('Citation removed from library')
  }

  const handleViewCitation = (citation: SavedCitation) => {
    const section = sections.find((s) => s.id === citation.sectionId)
    if (section) {
      setSavedCitations((current) =>
        (current || []).map((c) =>
          c.id === citation.id
            ? {
                ...c,
                accessCount: c.accessCount + 1,
                lastAccessed: new Date().toISOString(),
              }
            : c
        )
      )
      onSectionSelect(section)
    } else {
      toast.error('Section not found')
    }
  }

  const handleEditCitation = (citation: SavedCitation) => {
    setEditingCitation(citation)
    setShowEditCitation(true)
  }

  const handleSaveEditCitation = () => {
    if (!editingCitation) return

    setSavedCitations((current) =>
      (current || []).map((c) =>
        c.id === editingCitation.id
          ? { ...editingCitation, updatedAt: new Date().toISOString() }
          : c
      )
    )
    setShowEditCitation(false)
    setEditingCitation(null)
    toast.success('Citation updated')
  }

  const handleCopyCitation = async (citation: SavedCitation) => {
    try {
      await navigator.clipboard.writeText(citation.canonicalCitation)
      toast.success('Citation copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy citation')
    }
  }

  const handleAddToCollection = (citationId: string, collectionId: string) => {
    setSavedCitations((current) =>
      (current || []).map((c) => {
        if (c.id !== citationId) return c
        const collections = c.collections.includes(collectionId)
          ? c.collections.filter((id) => id !== collectionId)
          : [...c.collections, collectionId]
        return { ...c, collections, updatedAt: new Date().toISOString() }
      })
    )
    toast.success('Collection updated')
  }

  const handleExportLibrary = async () => {
    const exportData = {
      citations: savedCitations,
      collections: collections,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citation-library-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Library exported')
  }

  const getCitationCount = (collectionId: string) => {
    return (savedCitations || []).filter((c) => c.collections.includes(collectionId)).length
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Citation Library</h1>
          <p className="text-muted-foreground mt-1">
            Save and organize frequently used citations for quick reference
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportLibrary}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {filteredCitations.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowBatchExport(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          )}
          <Button size="sm" onClick={() => setShowNewCollection(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search citations, tags, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAscending className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('recent')}>
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                Alphabetical
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('most-used')}>
                Most Used
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('favorite')}>
                Favorites First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={selectedCollection} onValueChange={setSelectedCollection}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">
            <FolderOpen className="w-4 h-4 mr-2" />
            All Citations ({(savedCitations || []).length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="w-4 h-4 mr-2" />
            Favorites ({(savedCitations || []).filter((c) => c.isFavorite).length})
          </TabsTrigger>
          {(collections || []).map((collection) => (
            <TabsTrigger key={collection.id} value={collection.id}>
              <div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: collection.color }}
              />
              {collection.name} ({getCitationCount(collection.id)})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCollection} className="mt-6">
          {filteredCitations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookmarkSimple className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No citations saved yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                  When you bookmark a section, you can add it to your citation library for easy
                  access and organization.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCitations.map((citation) => {
                const document = documents.find((d) => d.id === citation.documentId)
                const section = sections.find((s) => s.id === citation.sectionId)

                return (
                  <Card key={citation.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-2">{citation.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {document?.title}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleFavorite(citation.id)}
                          >
                            {citation.isFavorite ? (
                              <Star weight="fill" className="w-4 h-4 text-accent" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <DotsThree className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewCitation(citation)}>
                                View Full Section
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCitation(citation)}>
                                <PencilSimple className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyCitation(citation)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Citation
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {(collections || []).length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    Add to Collection
                                  </div>
                                  {(collections || []).map((col) => (
                                    <DropdownMenuItem
                                      key={col.id}
                                      onClick={() => handleAddToCollection(citation.id, col.id)}
                                    >
                                      <div
                                        className="w-2 h-2 rounded-full mr-2"
                                        style={{ backgroundColor: col.color }}
                                      />
                                      {col.name}
                                      {citation.collections.includes(col.id) && ' ✓'}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteCitation(citation.id)}
                                className="text-destructive"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div
                        className="text-sm font-mono bg-muted/50 p-2 rounded border border-border cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleCopyCitation(citation)}
                      >
                        {citation.canonicalCitation}
                      </div>

                      {citation.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {citation.notes}
                        </p>
                      )}

                      {citation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {citation.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {citation.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{citation.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Used {citation.accessCount} times</span>
                        <span>
                          {new Date(citation.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleViewCitation(citation)}
                      >
                        View Section
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedCollection !== 'all' && selectedCollection !== 'favorites' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {(collections || []).find((c) => c.id === selectedCollection)?.name}
                </CardTitle>
                <CardDescription>
                  {(collections || []).find((c) => c.id === selectedCollection)?.description}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteCollection(selectedCollection)}
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Collection
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <Dialog open={showNewCollection} onOpenChange={setShowNewCollection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Organize your citations into themed collections for easy access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                placeholder="e.g., First Amendment Cases"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-description">Description (Optional)</Label>
              <Textarea
                id="collection-description"
                placeholder="Brief description of this collection"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Collection Color</Label>
              <div className="flex gap-2">
                {collectionColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newCollectionColor === color
                        ? 'border-foreground scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCollectionColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCollection(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection}>Create Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditCitation} onOpenChange={setShowEditCitation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Citation</DialogTitle>
            <DialogDescription>Update notes and tags for this citation</DialogDescription>
          </DialogHeader>
          {editingCitation && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Citation</Label>
                <div className="text-sm font-mono bg-muted p-2 rounded border border-border">
                  {editingCitation.canonicalCitation}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Add notes about why this citation is important..."
                  value={editingCitation.notes}
                  onChange={(e) =>
                    setEditingCitation({ ...editingCitation, notes: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  placeholder="e.g., commerce clause, federalism, precedent"
                  value={editingCitation.tags.join(', ')}
                  onChange={(e) =>
                    setEditingCitation({
                      ...editingCitation,
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter((t) => t),
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCitation(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditCitation}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BatchCitationExportDialog
        open={showBatchExport}
        onClose={() => setShowBatchExport(false)}
        citations={filteredCitations}
        documents={documents}
        sections={sections}
        jurisdictions={jurisdictions}
        userId={userId}
      />
    </div>
  )
}
