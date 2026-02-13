import { Button } from '@/components/ui/button'
import { MapPin, Gear, MagnifyingGlass, GraduationCap, Books, ChartBar, Scales, Scroll, GlobeHemisphereWest, Sun, Moon } from '@phosphor-icons/react'
import { Jurisdiction, RouteId } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface HeaderProps {
  selectedJurisdiction?: Jurisdiction
  jurisdictions: Jurisdiction[]
  onJurisdictionChange: (id: string) => void
  onSettingsClick: () => void
  activeRoute?: RouteId
  onNavigate?: (route: RouteId) => void
}

export function Header({
  selectedJurisdiction,
  jurisdictions,
  onJurisdictionChange,
  onSettingsClick,
  activeRoute,
  onNavigate,
}: HeaderProps) {
  const statesAndTerritories = jurisdictions.filter(
    j => j.type === 'state' || j.type === 'territory'
  )

  const { theme, setTheme } = useTheme()

  const desktopNavItems: { id: RouteId; label: string; icon: typeof MagnifyingGlass }[] = [
    { id: 'search', label: 'Search', icon: MagnifyingGlass },
    { id: 'case-law', label: 'Case Law', icon: Scales },
    { id: 'federal-register', label: 'Fed. Register', icon: Scroll },
    { id: 'legal-resources', label: 'Resources', icon: GlobeHemisphereWest },
    { id: 'citations', label: 'Citations', icon: Books },
    { id: 'analyzer', label: 'Analyze', icon: ChartBar },
  ]

  return (
    <header className="sticky top-0 bg-card border-b border-border z-40">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={() => onNavigate?.('home')}
          >
            <h1 className="text-xl md:text-2xl font-bold tracking-tight font-serif">
              Civics Stack
            </h1>
          </button>

          {/* Desktop nav links — hidden on mobile (handled by MobileNav) */}
          {onNavigate && (
            <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Quick links">
              {desktopNavItems.map(item => {
                const Icon = item.icon
                const isActive = activeRoute === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-1.5 text-sm',
                      isActive && 'font-semibold'
                    )}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedJurisdiction?.id}
            onValueChange={onJurisdictionChange}
          >
            <SelectTrigger className="w-[130px] md:w-[200px]">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <SelectValue placeholder="Select jurisdiction" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {statesAndTerritories.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
          >
            <Sun size={20} className="block dark:hidden" />
            <Moon size={20} className="hidden dark:block" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Gear size={20} />
          </Button>
        </div>
      </div>
    </header>
  )
}
