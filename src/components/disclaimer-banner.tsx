import { Warning, Scales, SealCheck } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { DownloadSimple } from '@phosphor-icons/react'

interface DisclaimerBannerProps {
  variant?: 'legal-advice' | 'verify-sources' | 'court-use' | 'educational'
  showIcon?: boolean
  dismissible?: boolean
  onDismiss?: () => void
  showExport?: boolean
  onExport?: () => void
}

const CONFIGS = {
  'legal-advice': {
    icon: Warning,
    iconColor: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800',
    titleColor: 'text-amber-900 dark:text-amber-200',
    textColor: 'text-amber-800 dark:text-amber-300',
    title: 'Not Legal Advice',
    description:
      'This is an educational tool only. It does NOT constitute legal advice and does NOT create an attorney-client relationship. For legal advice specific to your situation, consult a licensed attorney.',
  },
  'verify-sources': {
    icon: SealCheck,
    iconColor: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-300',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
    title: 'Always Verify Sources',
    description:
      'While we maintain strict verification standards, you are responsible for confirming all information through official government sources before relying on it.',
  },
  'court-use': {
    icon: Scales,
    iconColor: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-300',
    titleColor: 'text-purple-900',
    textColor: 'text-purple-800',
    title: 'For Court Filings',
    description:
      'Always cite directly to official government publications when preparing court documents. This educational platform is not admissible as legal authority. Consult the Bluebook or your jurisdiction citation rules.',
  },
  educational: {
    icon: Warning,
    iconColor: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-300',
    titleColor: 'text-indigo-900',
    textColor: 'text-indigo-800',
    title: 'Educational Purpose Only',
    description:
      'This application provides educational information to help you understand legal hierarchies and civic processes. It is designed to promote informed, lawful civic engagement.',
  },
} as const

export function DisclaimerBanner({
  variant = 'legal-advice',
  showIcon = true,
  dismissible = false,
  onDismiss,
  showExport = false,
  onExport,
}: DisclaimerBannerProps) {
  const config = CONFIGS[variant]
  const Icon = config.icon

  return (
    <div
      role="alert"
      className={`${config.bg} border rounded-lg px-4 py-3 flex items-start gap-3`}
    >
      {showIcon && (
        <Icon className={`h-5 w-5 ${config.iconColor} shrink-0 mt-0.5`} weight="fill" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${config.titleColor}`}>{config.title}</p>
        <p className={`text-xs sm:text-sm leading-relaxed mt-1 ${config.textColor}`}>
          {config.description}
        </p>
      </div>
      {(showExport || dismissible) && (
        <div className="flex items-center gap-1 shrink-0">
          {showExport && onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="h-7 px-2 text-xs gap-1"
            >
              <DownloadSimple className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          {dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 px-2 text-xs"
            >
              Dismiss
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

interface StickyDisclaimerProps {
  show: boolean
  variant?: 'legal-advice' | 'verify-sources' | 'court-use' | 'educational'
  onExport?: () => void
}

export function StickyDisclaimer({ show, variant = 'legal-advice', onExport }: StickyDisclaimerProps) {
  if (!show) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-40 animate-in slide-in-from-bottom-5 duration-300 drop-shadow-lg">
      <DisclaimerBanner
        variant={variant}
        showIcon
        dismissible={false}
        showExport
        onExport={onExport}
      />
    </div>
  )
}
