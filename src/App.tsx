import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/header'
import { MobileNav, TabId } from '@/components/mobile-nav'
import { HomeView } from '@/components/views/home-view'
import { LibraryView } from '@/components/views/library-view'
import { SearchView } from '@/components/views/search-view'
import { AnalyzerView } from '@/components/views/analyzer-view'
import { LearnView } from '@/components/views/learn-view'
import { SectionDetail } from '@/components/section-detail'
import { jurisdictions, documents, sections } from '@/lib/seed-data'
import { Section, Bookmark, UserSettings } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [showSectionDetail, setShowSectionDetail] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [settings, setSettings] = useKV<UserSettings>('user-settings', {
    selectedJurisdictionId: 'us-ca',
    secondaryJurisdictionIds: [],
    offlinePacks: [],
    analyticsOptIn: false,
    fontSize: 'medium'
  })

  const [bookmarks, setBookmarks] = useKV<Bookmark[]>('bookmarks', [])

  const selectedJurisdiction = jurisdictions.find(j => j.id === (settings?.selectedJurisdictionId || 'us-ca'))

  const handleJurisdictionChange = (jurisdictionId: string) => {
    setSettings(current => {
      if (!current) return {
        selectedJurisdictionId: jurisdictionId,
        secondaryJurisdictionIds: [],
        offlinePacks: [],
        analyticsOptIn: false,
        fontSize: 'medium' as const
      }
      return {
        ...current,
        selectedJurisdictionId: jurisdictionId
      }
    })
    toast.success('Jurisdiction updated')
  }

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section)
    setShowSectionDetail(true)
  }

  const handleBookmarkSection = () => {
    if (!selectedSection) return

    const existingBookmark = (bookmarks || []).find(b => b.sectionId === selectedSection.id)
    
    if (existingBookmark) {
      toast.info('Section already bookmarked')
      return
    }

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      sectionId: selectedSection.id,
      documentId: selectedSection.documentId,
      createdAt: new Date().toISOString(),
      note: selectedSection.title
    }

    setBookmarks(current => [newBookmark, ...(current || [])])
    toast.success('Section bookmarked')
  }

  const handleNavigateToBookmark = (bookmark: Bookmark) => {
    const section = sections.find(s => s.id === bookmark.sectionId)
    if (section) {
      handleSectionSelect(section)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setActiveTab('search')
  }

  const selectedDocument = selectedSection 
    ? documents.find(d => d.id === selectedSection.documentId)
    : undefined

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedJurisdiction={selectedJurisdiction}
        jurisdictions={jurisdictions}
        onJurisdictionChange={handleJurisdictionChange}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="px-4 py-6 md:px-8 pb-24 md:pb-8 max-w-7xl mx-auto">
        {activeTab === 'home' && (
          <HomeView
            selectedJurisdiction={selectedJurisdiction}
            recentBookmarks={bookmarks || []}
            onSearch={handleSearch}
            onNavigateToLibrary={() => setActiveTab('library')}
            onNavigateToAnalyzer={() => setActiveTab('analyzer')}
            onNavigateToBookmark={handleNavigateToBookmark}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            documents={documents}
            sections={sections}
            selectedJurisdictionId={settings?.selectedJurisdictionId}
            onDocumentSelect={(id) => console.log('Document selected:', id)}
            onSectionSelect={handleSectionSelect}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            documents={documents}
            sections={sections}
            onSectionSelect={handleSectionSelect}
          />
        )}

        {activeTab === 'analyzer' && (
          <AnalyzerView
            documents={documents}
            sections={sections}
            onSectionSelect={handleSectionSelect}
          />
        )}

        {activeTab === 'learn' && (
          <LearnView
            sections={sections}
            documents={documents}
            onSectionSelect={handleSectionSelect}
          />
        )}
      </main>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      <SectionDetail
        section={selectedSection}
        document={selectedDocument}
        open={showSectionDetail}
        onClose={() => setShowSectionDetail(false)}
        onBookmark={handleBookmarkSection}
      />

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="analytics">Usage Analytics</Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Help improve the app by sharing anonymous usage data
                </p>
                <Switch
                  id="analytics"
                  checked={settings?.analyticsOptIn || false}
                  onCheckedChange={(checked) =>
                    setSettings(current => {
                      if (!current) return {
                        selectedJurisdictionId: 'us-ca',
                        secondaryJurisdictionIds: [],
                        offlinePacks: [],
                        analyticsOptIn: checked,
                        fontSize: 'medium' as const
                      }
                      return { ...current, analyticsOptIn: checked }
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Privacy</Label>
              <p className="text-sm text-muted-foreground">
                Your notes and bookmarks are stored locally on your device. We do not collect 
                personal information or sell your data.
              </p>
            </div>

            <div className="space-y-2">
              <Label>About</Label>
              <p className="text-sm text-muted-foreground">
                Civics Stack helps you understand constitutional law and legal hierarchy through 
                accurate, cited primary sources. This is an educational tool and does not provide legal advice.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
    </div>
  )
}

export default App