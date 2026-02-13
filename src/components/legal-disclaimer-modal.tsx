import { useState } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Warning, SealCheck, ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import { LEGAL_DISCLAIMERS, DisclaimerType, recordUserAcknowledgment } from '@/lib/compliance'

interface LegalDisclaimerModalProps {
  open: boolean
  onAccept: () => void
  userId: string
}

export function LegalDisclaimerModal({ open, onAccept, userId }: LegalDisclaimerModalProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [checkedDisclaimers, setCheckedDisclaimers] = useState<Set<DisclaimerType>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  const requiredDisclaimers: DisclaimerType[] = [
    'not-legal-advice',
    'educational-only',
    'no-attorney-client',
    'verify-sources',
    'accuracy-limitation',
  ]

  const currentDisclaimerType = requiredDisclaimers[currentPage]
  const currentDisclaimer = LEGAL_DISCLAIMERS[currentDisclaimerType]
  const isCurrentChecked = checkedDisclaimers.has(currentDisclaimerType)
  const isLastPage = currentPage === requiredDisclaimers.length - 1
  const progressPercentage = ((currentPage + 1) / requiredDisclaimers.length) * 100

  const handleCheckboxChange = (checked: boolean) => {
    const newSet = new Set(checkedDisclaimers)
    if (checked) {
      newSet.add(currentDisclaimerType)
    } else {
      newSet.delete(currentDisclaimerType)
    }
    setCheckedDisclaimers(newSet)
  }

  const handleNext = () => {
    if (isCurrentChecked && !isLastPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleAccept = async () => {
    if (!isCurrentChecked) return

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
            <div className="flex-1">
              <DialogTitle className="text-2xl">Important Legal Information</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Disclosure {currentPage + 1} of {requiredDisclaimers.length}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium">{currentPage + 1}/{requiredDisclaimers.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <Warning className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-sm font-medium text-amber-900">
            You must read and acknowledge this disclosure to continue. These statements are
            essential for court-defensible compliance.
          </AlertDescription>
        </Alert>

        <ScrollArea className="h-[320px] pr-4">
          <div
            className={`border-2 rounded-lg p-6 transition-colors ${
              isCurrentChecked ? 'border-primary bg-primary/5' : 'border-border bg-card'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-xl font-serif flex items-center gap-2">
                    {currentDisclaimer.title}
                    {isCurrentChecked && (
                      <SealCheck className="w-6 h-6 text-primary" weight="fill" />
                    )}
                  </h3>
                  <p className="text-base text-foreground mt-4 leading-relaxed whitespace-pre-line">
                    {currentDisclaimer.content}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t">
                <Checkbox
                  id={`disclaimer-${currentDisclaimerType}`}
                  checked={isCurrentChecked}
                  onCheckedChange={(checked) => handleCheckboxChange(checked as boolean)}
                  className="mt-1"
                />
                <Label
                  htmlFor={`disclaimer-${currentDisclaimerType}`}
                  className="text-sm font-medium cursor-pointer leading-relaxed"
                >
                  I have read and understand this disclosure and acknowledge its importance for legal compliance
                </Label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 border-t pt-4">
          <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-1">
            <Button
              onClick={handleBack}
              disabled={currentPage === 0}
              variant="outline"
              size="lg"
              className="flex-1 sm:flex-initial"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex-1 order-1 sm:order-2" />
          <div className="flex gap-2 w-full sm:w-auto order-3">
            {!isLastPage ? (
              <Button
                onClick={handleNext}
                disabled={!isCurrentChecked}
                size="lg"
                className="flex-1 sm:flex-initial"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleAccept}
                disabled={!isCurrentChecked || isProcessing}
                size="lg"
                className="flex-1 sm:flex-initial"
              >
                {isProcessing ? 'Processing...' : 'Accept & Continue'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
