import { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react'
import { useKV } from '@/lib/local-storage-kv'
import { Warning } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { SectionDetail } from '@/components/section-detail'
import { LegalDisclaimerModal } from '@/components/legal-disclaimer-modal'
import { StickyDisclaimer } from '@/components/disclaimer-banner'
import { DisclaimerViewer } from '@/components/disclaimer-viewer'
import { HierarchyLadder } from '@/components/hierarchy-ladder'
import { BreadcrumbNav } from '@/components/breadcrumb-nav'
import { SupremeOverlay } from '@/components/supreme-overlay'
import { jurisdictions, documents, sections } from '@/lib/seed-data'
import { Section, Bookmark, UserSettings, RouteId } from '@/lib/types'
import { useHashRouter, navigateTo } from '@/lib/router'
import { buildBreadcrumbs } from '@/lib/hierarchy'
import { initializeSourceRegistry } from '@/lib/source-registry-data'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { hasAcknowledgedRequiredDisclaimers, createAuditLog } from '@/lib/compliance'

// ── Lazy-loaded views (code-split per route) ────────────────────────────
const HomeView = lazy(() => import('@/components/views/home-view').then(m => ({ default: m.HomeView })))
const SupremeLawView = lazy(() => import('@/components/views/supreme-law-view').then(m => ({ default: m.SupremeLawView })))
const MyJurisdictionView = lazy(() => import('@/components/views/my-jurisdiction-view').then(m => ({ default: m.MyJurisdictionView })))
const LocalOverlayView = lazy(() => import('@/components/views/local-overlay-view').then(m => ({ default: m.LocalOverlayView })))
const SearchView = lazy(() => import('@/components/views/search-view').then(m => ({ default: m.SearchView })))
const TreatiesView = lazy(() => import('@/components/views/treaties-view').then(m => ({ default: m.TreatiesView })))
const AnalyzerView = lazy(() => import('@/components/views/analyzer-view').then(m => ({ default: m.AnalyzerView })))
const LearnView = lazy(() => import('@/components/views/learn-view').then(m => ({ default: m.LearnView })))
const CitationLibraryView = lazy(() => import('@/components/views/citation-library-view').then(m => ({ default: m.CitationLibraryView })))
const CaseLawSearchView = lazy(() => import('@/components/views/case-law-view').then(m => ({ default: m.CaseLawSearchView })))
const FederalRegisterView = lazy(() => import('@/components/views/federal-register-view').then(m => ({ default: m.FederalRegisterView })))
const LegalResourcesView = lazy(() => import('@/components/views/legal-resources-view').then(m => ({ default: m.LegalResourcesView })))

function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

function App() {
  // ── Routing ────────────────────────────────────────────────────────────
  const { currentRoute, params, navigate } = useHashRouter()

  // ── UI State ───────────────────────────────────────────────────────────
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [showSectionDetail, setShowSectionDetail] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false)
  const [disclaimersAccepted, setDisclaimersAccepted] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [showStickyDisclaimer, setShowStickyDisclaimer] = useState(false)
  const [showDisclaimerViewer, setShowDisclaimerViewer] = useState(false)
  const [showSupremeOverlay, setShowSupremeOverlay] = useState(false)
  const [overlaySection, setOverlaySection] = useState<Section | null>(null)

  // ── Persisted State (Spark KV) ─────────────────────────────────────────
  const [settings, setSettings] = useKV<UserSettings>('user-settings', {
    selectedJurisdictionId: 'us-ca',
    secondaryJurisdictionIds: [],
    offlinePacks: [],
    analyticsOptIn: false,
    fontSize: 'medium'
  })

  const [bookmarks, setBookmarks] = useKV<Bookmark[]>('bookmarks', [])

  const selectedJurisdiction = jurisdictions.find(
    j => j.id === (settings?.selectedJurisdictionId || 'us-ca')
  )

  // Determine the active document from the hierarchy ladder
  const activeDocumentId = useMemo(() => {
    if (currentRoute === 'section' && params.id) {
      const sec = sections.find(s => s.id === params.id)
      return sec?.documentId
    }
    if (currentRoute === 'supreme-law') return 'us-constitution'
    return undefined
  }, [currentRoute, params])

  // ── Deep-link: auto-open section from URL ──────────────────────────────
  useEffect(() => {
    if (currentRoute === 'section' && params.id) {
      const sec = sections.find(s => s.id === params.id)
      if (sec) {
        setSelectedSection(sec)
        setShowSectionDetail(true)
      }
    }
    if (currentRoute === 'compare' && params.left && params.right) {
      const stateSection = sections.find(s => s.id === params.right)
      if (stateSection) {
        setOverlaySection(stateSection)
        setShowSupremeOverlay(true)
      }
    }
  }, [currentRoute, params])

  const [initFailed, setInitFailed] = useState(false)

  // ── App Initialization ─────────────────────────────────────────────────
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const user = await window.spark.user()
        const userIdentifier = user?.login || String(user?.id || '') || `anonymous-${Date.now()}`
        setUserId(userIdentifier)

        const hasAccepted = await hasAcknowledgedRequiredDisclaimers(userIdentifier)
        setDisclaimersAccepted(hasAccepted)
        
        if (!hasAccepted) {
          setShowDisclaimerModal(true)
        }

        // Initialize source registry on first load
        await initializeSourceRegistry()

        await createAuditLog({
          userId: userIdentifier,
          userRole: 'reader',
          action: 'view',
          entityType: 'application',
          entityId: 'app-start',
          metadata: { timestamp: new Date().toISOString() },
        })
      } catch (err) {
        console.error('App initialization error:', err)
        // Even if init fails, let user proceed through disclaimers
        setUserId(`anonymous-${Date.now()}`)
        setInitFailed(true)
        setShowDisclaimerModal(true)
      }
    }

    initializeApp()
  }, [])

  // ── Sticky Disclaimer for Analyzer ─────────────────────────────────────
  useEffect(() => {
    if (currentRoute === 'analyzer' && disclaimersAccepted) {
      setShowStickyDisclaimer(true)
    } else {
      setShowStickyDisclaimer(false)
    }
  }, [currentRoute, disclaimersAccepted])

  // ── Document title per route ───────────────────────────────────────────
  useEffect(() => {
    const titles: Partial<Record<RouteId, string>> = {
      home: 'Civics Stack',
      'supreme-law': 'Supreme Law – Civics Stack',
      'my-jurisdiction': `${selectedJurisdiction?.name ?? 'Jurisdiction'} – Civics Stack`,
      local: 'Local Authority – Civics Stack',
      search: 'Search – Civics Stack',
      treaties: 'Treaties – Civics Stack',
      analyzer: 'Analyzer – Civics Stack',
      learn: 'Learn – Civics Stack',
      citations: 'Citations – Civics Stack',
      'case-law': 'Case Law – Civics Stack',
      'federal-register': 'Federal Register – Civics Stack',
      'legal-resources': 'Legal Resources – Civics Stack',
    }
    document.title = titles[currentRoute] || 'Civics Stack'
  }, [currentRoute, selectedJurisdiction])

  // ── Global Cmd+K → Search ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        navigate('search')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  // ── Breadcrumbs – built from selected document context ─────────────────
  const breadcrumbs = useMemo(() => {
    const routeLabels: Partial<Record<RouteId, string>> = {
      home: 'Home',
      'supreme-law': 'Supreme Law',
      'my-jurisdiction': selectedJurisdiction?.name || 'My Jurisdiction',
      local: 'Local Authority',
      search: 'Search',
      treaties: 'Treaties',
      analyzer: 'Analyzer',
      learn: 'Learn',
      citations: 'Citation Library',
      'case-law': 'Case Law Search',
      'federal-register': 'Federal Register',
      'legal-resources': 'Legal Resources',
    }

    if (currentRoute === 'home') return []
    if (currentRoute === 'section' && selectedSection) {
      const doc = documents.find(d => d.id === selectedSection.documentId)
      if (doc) {
        return buildBreadcrumbs(selectedSection, doc, selectedJurisdiction, documents)
      }
    }

    const label = routeLabels[currentRoute]
    if (label) return [{ label }]

    return []
  }, [currentRoute, selectedSection, selectedJurisdiction])

  // ── Event Handlers ─────────────────────────────────────────────────────
  const handleJurisdictionChange = (jurisdictionId: string) => {
    setSettings(current => {
      if (!current) return {
        selectedJurisdictionId: jurisdictionId,
        secondaryJurisdictionIds: [],
        offlinePacks: [],
        analyticsOptIn: false,
        fontSize: 'medium' as const
      }
      return { ...current, selectedJurisdictionId: jurisdictionId }
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
    navigate('search', { q: query })
  }

  /** Open Supreme Overlay for a state section */
  const handleOpenOverlay = (section: Section) => {
    setOverlaySection(section)
    setShowSupremeOverlay(true)
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

  // ── Pre-Auth Gate ──────────────────────────────────────────────────────
  if (!disclaimersAccepted) {
    return (
      <>
        <LegalDisclaimerModal
          open={showDisclaimerModal}
          onAccept={handleDisclaimersAccepted}
          userId={userId}
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex items-center justify-center w-14 h-14 bg-amber-100 dark:bg-amber-900 rounded-xl mx-auto">
              <Warning className="w-7 h-7 text-amber-600 dark:text-amber-400" weight="fill" />
            </div>
            <h1 className="text-xl font-serif font-semibold">Civics Stack</h1>
            {!showDisclaimerModal ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {initFailed
                    ? 'There was a problem loading. You can still continue.'
                    : 'Loading application…'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisclaimerModal(true)}
                  className="mt-2"
                >
                  Review Legal Disclaimers
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please review and accept the legal disclaimers to continue.
              </p>
            )}
          </div>
        </div>
        <Toaster position="top-center" />
      </>
    )
  }

  // ── Main Layout ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        selectedJurisdiction={selectedJurisdiction}
        jurisdictions={jurisdictions}
        onJurisdictionChange={handleJurisdictionChange}
        onSettingsClick={() => setShowSettings(true)}
        activeRoute={currentRoute}
        onNavigate={(route) => navigate(route)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Hierarchy Sidebar */}
        <HierarchyLadder
          documents={documents}
          sections={sections}
          selectedJurisdictionId={settings?.selectedJurisdictionId}
          activeDocumentId={activeDocumentId}
          onNavigate={(route, routeParams) =>
            navigate(route as RouteId, routeParams)
          }
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb Trail */}
          {breadcrumbs.length > 0 && (
            <div className="px-4 md:px-8 pt-2 max-w-7xl mx-auto">
              <BreadcrumbNav
                items={breadcrumbs}
                onNavigate={(route, routeParams) =>
                  navigate(route as RouteId, routeParams)
                }
              />
            </div>
          )}

          <div className="px-4 py-6 md:px-8 pb-24 md:pb-8 max-w-7xl mx-auto">
            <Suspense fallback={<ViewLoader />}>
            {currentRoute === 'home' && (
              <HomeView
                selectedJurisdiction={selectedJurisdiction}
                recentBookmarks={bookmarks || []}
                onSearch={handleSearch}
                onNavigateToLibrary={() => navigate('supreme-law')}
                onNavigateToAnalyzer={() => navigate('analyzer')}
                onNavigateToBookmark={handleNavigateToBookmark}
                onNavigateToCitations={() => navigate('citations')}
                onNavigateToCaseLaw={() => navigate('case-law')}
                onNavigateToFederalRegister={() => navigate('federal-register')}
                onNavigateToResources={() => navigate('legal-resources')}
              />
            )}

            {currentRoute === 'supreme-law' && (
              <SupremeLawView
                documents={documents}
                sections={sections}
                onSectionSelect={handleSectionSelect}
                onNavigateToTreaties={() => navigate('treaties')}
              />
            )}

            {currentRoute === 'my-jurisdiction' && (
              <MyJurisdictionView
                jurisdiction={selectedJurisdiction}
                documents={documents}
                sections={sections}
                onSectionSelect={handleSectionSelect}
                onChangeJurisdiction={() => setShowSettings(true)}
              />
            )}

            {currentRoute === 'local' && (
              <LocalOverlayView
                jurisdiction={selectedJurisdiction}
              />
            )}

            {currentRoute === 'treaties' && (
              <TreatiesView
                documents={documents}
                sections={sections}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {currentRoute === 'search' && (
              <SearchView
                documents={documents}
                sections={sections}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {currentRoute === 'analyzer' && (
              <AnalyzerView
                documents={documents}
                sections={sections}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {currentRoute === 'learn' && (
              <LearnView
                sections={sections}
                documents={documents}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {currentRoute === 'citations' && (
              <CitationLibraryView
                documents={documents}
                sections={sections}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {currentRoute === 'case-law' && (
              <CaseLawSearchView />
            )}

            {currentRoute === 'federal-register' && (
              <FederalRegisterView />
            )}

            {currentRoute === 'legal-resources' && (
              <LegalResourcesView
                onNavigate={(route) => navigate(route)}
              />
            )}

            {/* Fallback for section deep link when detail is closed */}
            {currentRoute === 'section' && !showSectionDetail && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Section not found or has been closed.{' '}
                  <button
                    onClick={() => navigate('home')}
                    className="text-primary underline"
                  >
                    Return home
                  </button>
                </p>
              </div>
            )}

            {/* Fallback for unrecognized routes */}
            {!['home', 'supreme-law', 'my-jurisdiction', 'local', 'search',
              'treaties', 'analyzer', 'learn', 'citations', 'section',
              'document', 'compare', 'case-law', 'federal-register', 'legal-resources'].includes(currentRoute) && (
              <div className="text-center py-12">
                <p className="text-lg font-semibold">Page Not Found</p>
                <p className="text-muted-foreground mt-1">
                  <button
                    onClick={() => navigate('home')}
                    className="text-primary underline"
                  >
                    Return to home
                  </button>
                </p>
              </div>
            )}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav
        activeTab={currentRoute}
        onTabChange={(tab) => navigate(tab as RouteId)}
      />

      {/* Section Detail Sheet */}
      <SectionDetail
        section={selectedSection}
        document={selectedDocument}
        jurisdiction={selectedJurisdiction}
        userId={userId}
        open={showSectionDetail}
        onClose={() => setShowSectionDetail(false)}
        onBookmark={handleBookmarkSection}
      />

      {/* Supreme Overlay – Side-by-Side Comparison */}
      <SupremeOverlay
        open={showSupremeOverlay}
        onClose={() => setShowSupremeOverlay(false)}
        stateSection={overlaySection}
        allSections={sections}
        documents={documents}
        jurisdiction={selectedJurisdiction}
      />

      {/* Settings Dialog */}
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
              <Label>Legal Disclaimers</Label>
              <p className="text-sm text-muted-foreground">
                View, export, or print all legal disclaimers for your records
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDisclaimerViewer(true)
                  setShowSettings(false)
                }}
                className="w-full"
              >
                View & Export Disclaimers
              </Button>
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

      <DisclaimerViewer
        open={showDisclaimerViewer}
        onOpenChange={setShowDisclaimerViewer}
        userId={userId}
      />

      <Toaster position="top-center" />
      <StickyDisclaimer 
        show={showStickyDisclaimer} 
        variant="legal-advice"
        onExport={() => setShowDisclaimerViewer(true)}
      />
    </div>
  )
}

export default App