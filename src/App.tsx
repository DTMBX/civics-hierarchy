import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/header'
import { MobileNav, TabId } from '@/components/mobile-nav'
import { HomeView } from '@/components/views/home-view'
import { SupremeLawView } from '@/components/views/supreme-law-view'
import { MyJurisdictionView } from '@/components/views/my-jurisdiction-view'
import { LocalOverlayView } from '@/components/views/local-overlay-view'
import { LibraryView } from '@/components/views/library-view'
import { SearchView } from '@/components/views/search-view'
import { TreatiesView } from '@/components/views/treaties-view'
import { AnalyzerView } from '@/components/views/analyzer-view'
import { LearnView } from '@/components/views/learn-view'
import { CitationLibraryView } from '@/components/views/citation-library-view'
import { LocalOrdinanceSubmission } from '@/components/local-ordinance-submission'
import { SectionDetail } from '@/components/section-detail'
import { LegalDisclaimerModal } from '@/components/legal-disclaimer-modal'
import { StickyDisclaimer } from '@/components/disclaimer-banner'
import { jurisdictions, documents, sections } from '@/lib/seed-data'
import { Section, Bookmark, UserSettings } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { hasAcknowledgedRequiredDisclaimers, createAuditLog } from '@/lib/compliance'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [showSectionDetail, setShowSectionDetail] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false)
  const [disclaimersAccepted, setDisclaimersAccepted] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [showStickyDisclaimer, setShowStickyDisclaimer] = useState(false)

  const [settings, setSettings] = useKV<UserSettings>('user-settings', {
    selectedJurisdictionId: 'us-ca',
    secondaryJurisdictionIds: [],
    offlinePacks: [],
    analyticsOptIn: false,
    fontSize: 'medium'
  })

  const [bookmarks, setBookmarks] = useKV<Bookmark[]>('bookmarks', [])

  const selectedJurisdiction = jurisdictions.find(j => j.id === (settings?.selectedJurisdictionId || 'us-ca'))

  useEffect(() => {
    const initializeApp = async () => {
      const user = await window.spark.user()
      const userIdentifier = user?.login || String(user?.id || '') || `anonymous-${Date.now()}`
      setUserId(userIdentifier)

      const hasAccepted = await hasAcknowledgedRequiredDisclaimers(userIdentifier)
      setDisclaimersAccepted(hasAccepted)
      
      if (!hasAccepted) {
        setShowDisclaimerModal(true)
      }

      await createAuditLog({
        userId: userIdentifier,
        userRole: 'reader',
        action: 'view',
        entityType: 'application',
        entityId: 'app-start',
        metadata: { timestamp: new Date().toISOString() },
      })
    }

    initializeApp()
  }, [])

  useEffect(() => {
    if (activeTab === 'analyzer' && disclaimersAccepted) {
      setShowStickyDisclaimer(true)
    } else {
      setShowStickyDisclaimer(false)
    }
  }, [activeTab, disclaimersAccepted])

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

  const handleSectionSelect = async (section: Section) => {
    setSelectedSection(section)
    setShowSectionDetail(true)

    if (userId) {
      await createAuditLog({
        userId,
        userRole: 'reader',
        action: 'view',
        entityType: 'section',
        entityId: section.id,
        metadata: { 
          documentId: section.documentId, 
          title: section.title,
          citation: section.canonicalCitation 
        },
      })
    }
  }

  const handleBookmarkSection = async () => {
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

    if (userId) {
      await createAuditLog({
        userId,
        userRole: 'reader',
        action: 'create',
        entityType: 'bookmark',
        entityId: newBookmark.id,
        metadata: { 
          sectionId: selectedSection.id,
          documentId: selectedSection.documentId 
        },
      })
    }
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

  const handleDisclaimersAccepted = () => {
    setDisclaimersAccepted(true)
    setShowDisclaimerModal(false)
    toast.success('Welcome to Civics Stack', {
      description: 'You can now explore legal hierarchies and constitutional text.',
    })
  }

  if (!disclaimersAccepted) {
    return (
      <>
        <LegalDisclaimerModal
          open={showDisclaimerModal}
          onAccept={handleDisclaimersAccepted}
          userId={userId}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </>
    )
  }

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
            onNavigateToLibrary={() => setActiveTab('supreme-law')}
            onNavigateToAnalyzer={() => setActiveTab('analyzer')}
            onNavigateToBookmark={handleNavigateToBookmark}
            onNavigateToCitations={() => setActiveTab('citations')}
          />
        )}

        {activeTab === 'supreme-law' && (
          <SupremeLawView
            documents={documents}
            sections={sections}
            onSectionSelect={handleSectionSelect}
            onNavigateToTreaties={() => setActiveTab('treaties')}
          />
        )}

        {activeTab === 'my-jurisdiction' && (
          <MyJurisdictionView
            jurisdiction={selectedJurisdiction}
            documents={documents}
            sections={sections}
            onSectionSelect={handleSectionSelect}
            onChangeJurisdiction={() => setShowSettings(true)}
          />
        )}

        {activeTab === 'local' && (
          <LocalOverlayView
            jurisdiction={selectedJurisdiction}
          />
        )}

        {activeTab === 'treaties' && (
          <TreatiesView
            documents={documents}
            sections={sections}
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

        {activeTab === 'citations' && (
          <CitationLibraryView
            documents={documents}
            sections={sections}
            onSectionSelect={handleSectionSelect}
          />
        )}
      </main>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      <SectionDetail
        section={selectedSection}
        document={selectedDocument}
        jurisdiction={selectedJurisdiction}
        userId={userId}
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
      <StickyDisclaimer show={showStickyDisclaimer} variant="legal-advice" />
    </div>
  )
}

export default App