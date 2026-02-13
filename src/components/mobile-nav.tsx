import { House, Scales, MapPin, MagnifyingGlass, ChartBar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { RouteId } from '@/lib/types'

interface MobileNavProps {
  activeTab: RouteId
  onTabChange: (tab: RouteId) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const tabs: { id: RouteId; label: string; icon: typeof House }[] = [
    { id: 'home', label: 'Home', icon: House },
    { id: 'supreme-law', label: 'Supreme', icon: Scales },
    { id: 'my-jurisdiction', label: 'My State', icon: MapPin },
    { id: 'search', label: 'Search', icon: MagnifyingGlass },
    { id: 'analyzer', label: 'Analyze', icon: ChartBar },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden"
         aria-label="Main navigation">
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
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
