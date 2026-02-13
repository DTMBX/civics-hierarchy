import { HIERARCHY_LADDER_RUNGS, buildHierarchyTree } from '@/lib/hierarchy'
import { Document, Section, AuthorityLevel } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Scales,
  FileText,
  Globe,
  Bank,
  MapPin,
  CaretRight,
  Shield,
} from '@phosphor-icons/react'

interface HierarchyLadderProps {
  documents: Document[]
  sections: Section[]
  selectedJurisdictionId?: string
  activeDocumentId?: string
  onNavigate: (route: string, params?: Record<string, string>) => void
}

const LEVEL_ICONS: Record<number, React.ReactNode> = {
  1: <Shield size={18} weight="fill" />,
  2: <FileText size={18} />,
  3: <Globe size={18} />,
  4: <Bank size={18} />,
  5: <FileText size={18} />,
  6: <Scales size={18} weight="fill" />,
  7: <FileText size={18} />,
  8: <FileText size={18} />,
  9: <MapPin size={18} />,
}

const LEVEL_COLORS: Record<AuthorityLevel, string> = {
  federal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  state: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  territory: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  local: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

export function HierarchyLadder({
  documents,
  sections,
  selectedJurisdictionId,
  activeDocumentId,
  onNavigate,
}: HierarchyLadderProps) {
  const tree = buildHierarchyTree(documents, sections, selectedJurisdictionId)

  return (
    <aside
      className="hidden md:flex flex-col w-72 border-r bg-card"
      role="navigation"
      aria-label="Authority Hierarchy"
    >
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          Authority Hierarchy
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Highest → Lowest authority
        </p>
      </div>

      <ScrollArea className="flex-1">
        <nav className="py-2" aria-label="Hierarchy ladder">
          {HIERARCHY_LADDER_RUNGS.map((rung, idx) => {
            const node = tree.find(n => n.level === rung.level)
            const sectionCount = node?.sectionCount ?? 0
            const isActive = node?.documentId === activeDocumentId

            // Route mapping
            let route = 'supreme-law'
            const params: Record<string, string> = {}
            if (rung.level <= 5) {
              route = rung.documentType === 'treaty' ? 'treaties' : 'supreme-law'
            } else if (rung.level <= 8) {
              route = 'my-jurisdiction'
            } else {
              route = 'local'
            }

            return (
              <div key={rung.level}>
                <button
                  onClick={() => onNavigate(route, params)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left text-sm
                    transition-colors hover:bg-accent/50 group
                    ${isActive ? 'bg-accent border-l-2 border-primary' : ''}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Hierarchy level indicator */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`
                        flex items-center justify-center w-7 h-7 rounded-md shrink-0
                        ${LEVEL_COLORS[rung.authorityLevel]}
                      `}
                    >
                      {LEVEL_ICONS[rung.level]}
                    </span>

                    <div className="min-w-0">
                      <div className="font-medium truncate leading-tight">
                        {rung.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Level {rung.level}
                        {sectionCount > 0 && ` · ${sectionCount} sections`}
                      </div>
                    </div>
                  </div>

                  <CaretRight
                    size={14}
                    className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </button>

                {/* Connecting line between rungs */}
                {idx < HIERARCHY_LADDER_RUNGS.length - 1 && (
                  <div className="ml-7 pl-[7px]">
                    <div className="w-px h-2 bg-border" />
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Legend */}
      <div className="p-3 border-t text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded bg-blue-200 dark:bg-blue-800" />
          Federal
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded bg-amber-200 dark:bg-amber-800" />
          State
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded bg-green-200 dark:bg-green-800" />
          Local
        </div>
      </div>
    </aside>
  )
}
