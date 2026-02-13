import { Button } from '@/components/ui/button'
import { MapPin, Gear } from '@phosphor-icons/react'
import { Jurisdiction } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface HeaderProps {
  selectedJurisdiction?: Jurisdiction
  jurisdictions: Jurisdiction[]
  onJurisdictionChange: (id: string) => void
  onSettingsClick: () => void
}

export function Header({
  selectedJurisdiction,
  jurisdictions,
  onJurisdictionChange,
  onSettingsClick
}: HeaderProps) {
  const statesAndTerritories = jurisdictions.filter(
    j => j.type === 'state' || j.type === 'territory'
  )

  return (
    <header className="sticky top-0 bg-card border-b border-border z-40">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Civics Stack
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedJurisdiction?.id}
            onValueChange={onJurisdictionChange}
          >
            <SelectTrigger className="w-[160px] md:w-[200px]">
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

          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Gear size={20} />
          </Button>
        </div>
      </div>
    </header>
  )
}
