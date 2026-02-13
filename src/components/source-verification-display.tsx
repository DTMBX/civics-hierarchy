import { SealCheck, Warning, Info, CalendarCheck } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { VerificationStatus } from '@/lib/types'

interface SourceVerificationDisplayProps {
  verificationStatus: VerificationStatus
  sourceUrl?: string
  lastChecked?: string
  canonicalCitation: string
  documentTitle: string
  onGenerateCitation?: () => void
}

export function SourceVerificationDisplay({
  verificationStatus,
  sourceUrl,
  lastChecked,
  canonicalCitation,
  documentTitle,
  onGenerateCitation,
}: SourceVerificationDisplayProps) {
  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'official':
        return {
          icon: SealCheck,
          label: 'Official Source',
          color: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600',
          description:
            'Verified from official government source. Court-defensible provenance documented.',
        }
      case 'verified':
        return {
          icon: SealCheck,
          label: 'Verified',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          iconColor: 'text-blue-600',
          description: 'Verified by curators against primary sources. Citation traceable.',
        }
      case 'unverified':
        return {
          icon: Warning,
          label: 'Unverified',
          color: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700',
          iconColor: 'text-amber-600 dark:text-amber-400',
          description:
            'User-submitted content. Not independently verified. Do not rely on for legal purposes.',
        }
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${config.color}`}>
              <StatusIcon className={`w-5 h-5 ${config.iconColor}`} weight="fill" />
            </div>
            <div>
              <CardTitle className="text-lg font-serif">Source Verification</CardTitle>
              <CardDescription className="text-sm mt-1">
                Court-defensible citation and provenance information
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`${config.color} border-2 font-semibold`}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            Verification Status
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{config.description}</p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Canonical Citation
            </h4>
            <p className="text-sm font-mono bg-secondary/50 p-3 rounded border">
              {canonicalCitation}
            </p>
          </div>

          {sourceUrl && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Official Source URL
              </h4>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all block bg-secondary/50 p-3 rounded border"
              >
                {sourceUrl}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <CalendarCheck className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last verified:</span>
            <span className="font-medium">{formatDate(lastChecked)}</span>
          </div>
        </div>

        {verificationStatus === 'unverified' && (
          <>
            <Separator />
            <div className="bg-amber-50 dark:bg-amber-950 border-2 border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">⚠️ Court Use Warning</p>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                This content has not been independently verified. Do NOT cite this in court filings
                or legal proceedings. Always verify through official government sources.
              </p>
            </div>
          </>
        )}

        {onGenerateCitation && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Generate a court-defensible citation with full provenance information
              </p>
              <Button onClick={onGenerateCitation} variant="outline" className="w-full">
                Generate Full Citation
              </Button>
            </div>
          </>
        )}

        <Separator />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-900 mb-2">
            📋 For Court Filings & Legal Proceedings
          </p>
          <p className="text-xs text-blue-800 leading-relaxed">
            Always cite directly to official government publications, not to this educational
            platform. Consult the{' '}
            <span className="font-semibold">Bluebook</span> or your jurisdiction's citation rules.
            This tool provides reference information only.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface VerificationBadgeProps {
  status: VerificationStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function VerificationBadge({ status, showLabel = true, size = 'md' }: VerificationBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case 'official':
        return {
          icon: SealCheck,
          label: 'Official',
          className: 'bg-green-100 text-green-800 border-green-300',
          iconColor: 'text-green-700',
        }
      case 'verified':
        return {
          icon: SealCheck,
          label: 'Verified',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          iconColor: 'text-blue-700',
        }
      case 'unverified':
        return {
          icon: Warning,
          label: 'Unverified',
          className: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          iconColor: 'text-amber-700 dark:text-amber-400',
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${config.className} border font-semibold inline-flex items-center gap-1.5`}
          >
            <Icon className={`${iconSize} ${config.iconColor}`} weight="fill" />
            {showLabel && <span className={textSize}>{config.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {status === 'official' && 'From official government source'}
            {status === 'verified' && 'Curator-verified against primary sources'}
            {status === 'unverified' && 'User-submitted, not independently verified'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
