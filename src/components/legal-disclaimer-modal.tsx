import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Warning, SealCheck } from '@phosphor-icons/react'
import { LEGAL_DISCLAIMERS, DisclaimerType, recordUserAcknowledgment } from '@/lib/compliance'

interface LegalDisclaimerModalProps {
  open: boolean
  onAccept: () => void
  userId: string
}

export function LegalDisclaimerModal({ open, onAccept, userId }: LegalDisclaimerModalProps) {
  const [checkedDisclaimers, setCheckedDisclaimers] = useState<Set<DisclaimerType>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  const requiredDisclaimers: DisclaimerType[] = [
    'not-legal-advice',
    'educational-only',
    'no-attorney-client',
    'verify-sources',
    'accuracy-limitation',
  ]

  const allChecked = requiredDisclaimers.every((type) => checkedDisclaimers.has(type))

  const handleCheckboxChange = (type: DisclaimerType, checked: boolean) => {
    const newSet = new Set(checkedDisclaimers)
    if (checked) {
      newSet.add(type)
    } else {
      newSet.delete(type)
    }
    setCheckedDisclaimers(newSet)
  }

  const handleAccept = async () => {
    if (!allChecked) return

    setIsProcessing(true)
    try {
      for (const disclaimerType of requiredDisclaimers) {
        await recordUserAcknowledgment(userId, disclaimerType)
      }
      onAccept()
    } catch (error) {
      console.error('Error recording acknowledgments:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
              <Warning className="w-6 h-6 text-amber-600" weight="fill" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Important Legal Information</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Please read and acknowledge these required disclosures before using Civics Stack
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Alert className="border-amber-200 bg-amber-50">
          <Warning className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-sm font-medium text-amber-900">
            You must read and acknowledge all disclosures below to continue. These statements are
            essential for court-defensible compliance.
          </AlertDescription>
        </Alert>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {requiredDisclaimers.map((type) => {
              const disclaimer = LEGAL_DISCLAIMERS[type]
              const isChecked = checkedDisclaimers.has(type)

              return (
                <div
                  key={type}
                  className={`border-2 rounded-lg p-5 transition-colors ${
                    isChecked ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg font-serif flex items-center gap-2">
                          {disclaimer.title}
                          {isChecked && (
                            <SealCheck className="w-5 h-5 text-primary" weight="fill" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
                          {disclaimer.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t">
                      <Checkbox
                        id={`disclaimer-${type}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(type, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`disclaimer-${type}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        I have read and understand this disclosure
                      </Label>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-3 border-t pt-4">
          <div className="flex-1 text-sm text-muted-foreground">
            By accepting, you acknowledge that this is an educational tool and does not provide
            legal advice.
          </div>
          <Button
            onClick={handleAccept}
            disabled={!allChecked || isProcessing}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isProcessing ? 'Processing...' : 'Accept & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
