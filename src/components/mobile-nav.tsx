import { House, Books, MagnifyingGlass, ChartBar, GraduationCap, Upload } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type TabId = 'home' | 'library' | 'search' | 'analyzer' | 'learn' | 'contribute'

interface MobileNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const tabs = [
    { id: 'home' as TabId, label: 'Home', icon: House },
    { id: 'library' as TabId, label: 'Library', icon: Books },
    { id: 'search' as TabId, label: 'Search', icon: MagnifyingGlass },
    { id: 'analyzer' as TabId, label: 'Analyzer', icon: ChartBar },
    { id: 'learn' as TabId, label: 'Learn', icon: GraduationCap },
    { id: 'contribute' as TabId, label: 'Contribute', icon: Upload }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
