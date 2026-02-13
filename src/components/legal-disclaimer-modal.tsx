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
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Warning, SealCheck, ArrowRight, ArrowLeft, DownloadSimple, Printer, FileText } from '@phosphor-icons/react'
import { LEGAL_DISCLAIMERS, DisclaimerType, recordUserAcknowledgment } from '@/lib/compliance'
import {
  generateDisclaimerDocument,
  downloadDisclaimer,
  printDisclaimer,
  copyToClipboard,
  getAllDisclaimerTypes,
} from '@/lib/disclaimer-export'
import { toast } from 'sonner'

interface LegalDisclaimerModalProps {
  open: boolean
  onAccept: () => void
  userId: string
}

export function LegalDisclaimerModal({ open, onAccept, userId }: LegalDisclaimerModalProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [checkedDisclaimers, setCheckedDisclaimers] = useState<Set<DisclaimerType>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

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

  useEffect(() => {
    setScrolledToBottom(false)
  }, [currentPage])

  const handleCheckboxChange = (checked: boolean) => {
    const newSet = new Set(checkedDisclaimers)
    if (checked) {
      newSet.add(currentDisclaimerType)
      
      if (!isLastPage) {
        setTimeout(() => {
          setCurrentPage(currentPage + 1)
        }, 400)
      }
    } else {
      newSet.delete(currentDisclaimerType)
    }
    setCheckedDisclaimers(newSet)
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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    const scrollThreshold = 20
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < scrollThreshold
    setScrolledToBottom(isAtBottom)
  }

  const handleExport = async (format: 'html' | 'markdown' | 'text') => {
    try {
      const user = await window.spark.user()
      const content = generateDisclaimerDocument(requiredDisclaimers, {
        format,
        includeMetadata: true,
        includeTimestamp: true,
        userId: userId,
        userName: user?.login,
      })
      downloadDisclaimer(content, format)
      toast.success(`Disclaimers exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export disclaimers')
      console.error('Export error:', error)
    }
  }

  const handlePrint = async () => {
    try {
      const user = await window.spark.user()
      const content = generateDisclaimerDocument(requiredDisclaimers, {
        format: 'html',
        includeMetadata: true,
        includeTimestamp: true,
        userId: userId,
        userName: user?.login,
      })
      printDisclaimer(content)
      toast.success('Opening print dialog...')
    } catch (error) {
      toast.error('Failed to print disclaimers')
      console.error('Print error:', error)
    }
  }

  const handleCopyText = async () => {
    try {
      const user = await window.spark.user()
      const content = generateDisclaimerDocument(requiredDisclaimers, {
        format: 'text',
        includeMetadata: true,
        includeTimestamp: true,
        userId: userId,
        userName: user?.login,
      })
      await copyToClipboard(content)
      toast.success('Disclaimers copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
      console.error('Copy error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl w-[95vw] h-[95vh] max-h-[900px] flex flex-col p-0" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 bg-amber-100 rounded-xl shrink-0">
              <Warning className="w-7 h-7 text-amber-600" weight="fill" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl md:text-3xl font-serif">Important Legal Information</DialogTitle>
              <DialogDescription className="text-base mt-1.5">
                Disclosure {currentPage + 1} of {requiredDisclaimers.length}
              </DialogDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <DownloadSimple className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export All Disclaimers</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('html')} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Download as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('markdown')} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Download as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('text')} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Download as Text
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePrint} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print Disclaimers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyText} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Copy as Text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 border-b shrink-0 space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">Progress</span>
            <span className="font-semibold text-foreground">{currentPage + 1} / {requiredDisclaimers.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2.5" />
        </div>

        <Alert className="mx-6 mt-4 border-amber-300 bg-amber-50 shrink-0">
          <Warning className="h-5 w-5 text-amber-600" weight="fill" />
          <AlertDescription className="text-sm font-medium text-amber-900 leading-relaxed">
            Please read the disclosure carefully and scroll to the bottom. Check the box to acknowledge and automatically proceed to the next disclosure.
          </AlertDescription>
        </Alert>

        <div className="flex-1 overflow-hidden px-6 py-4">
          <ScrollArea className="h-full pr-4" onScrollCapture={handleScroll}>
            <div
              className={`border-2 rounded-xl p-6 md:p-8 transition-all duration-300 ${
                isCurrentChecked 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'border-border bg-card'
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-2xl md:text-3xl font-serif flex items-center gap-3 flex-wrap">
                      {currentDisclaimer.title}
                      {isCurrentChecked && (
                        <SealCheck className="w-7 h-7 text-primary shrink-0 animate-in zoom-in-50" weight="fill" />
                      )}
                    </h3>
                    <div className="mt-6 prose prose-base max-w-none">
                      <p className="text-base md:text-lg text-foreground leading-relaxed whitespace-pre-line">
                        {currentDisclaimer.content}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-6 border-t-2">
                  <Checkbox
                    id={`disclaimer-${currentDisclaimerType}`}
                    checked={isCurrentChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(checked as boolean)}
                    className="mt-1.5 h-5 w-5"
                    disabled={!scrolledToBottom && currentDisclaimer.content.length > 500}
                  />
                  <Label
                    htmlFor={`disclaimer-${currentDisclaimerType}`}
                    className="text-sm md:text-base font-medium cursor-pointer leading-relaxed flex-1"
                  >
                    I have read and understand this disclosure in full and acknowledge its importance for legal compliance and court-defensible documentation
                  </Label>
                </div>
                
                {!scrolledToBottom && currentDisclaimer.content.length > 500 && !isCurrentChecked && (
                  <Alert className="border-blue-300 bg-blue-50">
                    <AlertDescription className="text-sm text-blue-900">
                      Please scroll to the bottom to enable the acknowledgment checkbox.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 flex-row justify-between items-center gap-3">
          <Button
            onClick={handleBack}
            disabled={currentPage === 0}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            {isLastPage && (
              <Button
                onClick={handleAccept}
                disabled={!isCurrentChecked || isProcessing}
                size="lg"
                className="gap-2 min-w-[180px]"
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    Accept & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
            {!isLastPage && isCurrentChecked && (
              <div className="text-sm text-muted-foreground italic">
                Advancing to next disclosure...
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
