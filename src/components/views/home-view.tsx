import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, BookmarkSimple, ClockCounterClockwise, Books, ChartBar } from '@phosphor-icons/react'
import { Bookmark, Jurisdiction } from '@/lib/types'
import { useState } from 'react'

interface HomeViewProps {
  selectedJurisdiction?: Jurisdiction
  recentBookmarks: Bookmark[]
  onSearch: (query: string) => void
  onNavigateToLibrary: () => void
  onNavigateToAnalyzer: () => void
  onNavigateToBookmark: (bookmark: Bookmark) => void
}

export function HomeView({
  selectedJurisdiction,
  recentBookmarks,
  onSearch,
  onNavigateToLibrary,
  onNavigateToAnalyzer,
  onNavigateToBookmark
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery)
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Understand the Law
          </h2>
          <p className="text-muted-foreground mt-1">
            Access constitutional documents and learn about legal hierarchy
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search constitutional text, amendments..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            Search
          </Button>
        </div>
      </section>

      {selectedJurisdiction && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Your Jurisdiction</CardTitle>
            <CardDescription>
              Currently viewing laws for {selectedJurisdiction.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onNavigateToLibrary} className="w-full">
              <Books size={18} />
              View My Legal Stack
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="grid md:grid-cols-2 gap-4">
        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onNavigateToLibrary}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Books size={24} className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Constitutional Library</CardTitle>
                <CardDescription>
                  Browse U.S. Constitution and state documents
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onNavigateToAnalyzer}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <ChartBar size={24} className="text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Conflict Analyzer</CardTitle>
                <CardDescription>
                  Learn to evaluate legal conflicts and preemption
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </section>

      {recentBookmarks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ClockCounterClockwise size={20} className="text-muted-foreground" />
            <h3 className="font-semibold">Recent Bookmarks</h3>
          </div>
          <div className="space-y-2">
            {recentBookmarks.slice(0, 5).map((bookmark) => (
              <Card
                key={bookmark.id}
                className="cursor-pointer transition-shadow hover:shadow-sm"
                onClick={() => onNavigateToBookmark(bookmark)}
              >
                <CardContent className="flex items-center gap-3 py-3">
                  <BookmarkSimple size={18} className="text-primary" weight="fill" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {bookmark.note || 'Bookmarked section'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bookmark.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
