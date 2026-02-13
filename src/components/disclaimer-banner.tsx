import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Warning, Scales, SealCheck } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface DisclaimerBannerProps {
  variant?: 'legal-advice' | 'verify-sources' | 'court-use' | 'educational'
  showIcon?: boolean
  dismissible?: boolean
  onDismiss?: () => void
}

export function DisclaimerBanner({
  variant = 'legal-advice',
  showIcon = true,
  dismissible = false,
  onDismiss,
}: DisclaimerBannerProps) {
  const configs = {
    'legal-advice': {
      icon: Warning,
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-400',
      title: 'Not Legal Advice',
      description:
        'This is an educational tool only. It does NOT constitute legal advice and does NOT create an attorney-client relationship. For legal advice specific to your situation, consult a licensed attorney.',
    },
    'verify-sources': {
      icon: SealCheck,
      iconColor: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-400',
      title: 'Always Verify Sources',
      description:
        'While we maintain strict verification standards, you are responsible for confirming all information through official government sources before relying on it.',
    },
    'court-use': {
      icon: Scales,
      iconColor: 'text-purple-700',
      bgColor: 'bg-purple-50 border-purple-400',
      title: 'For Court Filings',
      description:
        'Always cite directly to official government publications when preparing court documents. This educational platform is not admissible as legal authority. Consult the Bluebook or your jurisdiction citation rules.',
    },
    educational: {
      icon: Warning,
      iconColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50 border-indigo-400',
      title: 'Educational Purpose Only',
      description:
        'This application provides educational information to help you understand legal hierarchies and civic processes. It is designed to promote informed, lawful civic engagement.',
    },
  }

  const config = configs[variant]
  const Icon = config.icon

  return (
    <Alert className={`${config.bgColor} border-2 shadow-lg`}>
      {showIcon && <Icon className={`h-5 w-5 ${config.iconColor} shrink-0`} weight="fill" />}
      <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <AlertTitle className="font-bold text-sm mb-1.5">{config.title}</AlertTitle>
          <AlertDescription className="text-xs md:text-sm leading-relaxed">
            {config.description}
          </AlertDescription>
        </div>
        {dismissible && onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss} 
            className="shrink-0 h-8 px-3 text-xs"
          >
            Dismiss
          </Button>
        )}
      </div>
    </Alert>
  )
}

interface StickyDisclaimerProps {
  show: boolean
  variant?: 'legal-advice' | 'verify-sources' | 'court-use' | 'educational'
}

export function StickyDisclaimer({ show, variant = 'legal-advice' }: StickyDisclaimerProps) {
  if (!show) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-40 animate-in slide-in-from-bottom-5 duration-300">
      <DisclaimerBanner variant={variant} showIcon={true} dismissible={false} />
    </div>
  )
}
