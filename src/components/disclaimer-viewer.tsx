import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Warning, DownloadSimple, Printer, FileText, Info } from '@phosphor-icons/react'
import { LEGAL_DISCLAIMERS, DisclaimerType } from '@/lib/compliance'
import {
  generateDisclaimerDocument,
  downloadDisclaimer,
  printDisclaimer,
  copyToClipboard,
  getAllDisclaimerTypes,
} from '@/lib/disclaimer-export'
import { toast } from 'sonner'

interface DisclaimerViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}

export function DisclaimerViewer({ open, onOpenChange, userId }: DisclaimerViewerProps) {
  const [selectedTypes, setSelectedTypes] = useState<DisclaimerType[]>(getAllDisclaimerTypes())
  const allDisclaimerTypes = getAllDisclaimerTypes()

  const handleExport = async (format: 'html' | 'markdown' | 'text') => {
    try {
      const user = await window.spark.user()
      const content = generateDisclaimerDocument(selectedTypes, {
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
      const content = generateDisclaimerDocument(selectedTypes, {
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
      const content = generateDisclaimerDocument(selectedTypes, {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[900px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg shrink-0">
                <Warning className="w-6 h-6 text-amber-600" weight="fill" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif">Legal Disclaimers</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Review and export all legal disclaimers
                </DialogDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="gap-2">
                  <DownloadSimple className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
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

        <div className="flex-1 overflow-hidden px-6 py-4">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All Disclaimers</TabsTrigger>
              <TabsTrigger value="required">Required</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4 pb-4">
                  {allDisclaimerTypes.map((type) => {
                    const disclaimer = LEGAL_DISCLAIMERS[type]
                    return (
                      <Card key={type} className="border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-xl font-serif flex items-center gap-2 flex-wrap">
                                {disclaimer.title}
                                {disclaimer.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="mt-2 flex flex-wrap gap-3 text-xs">
                                <span>ID: {disclaimer.id}</span>
                                <span>Version: {disclaimer.version}</span>
                                <span>Effective: {disclaimer.effectiveDate}</span>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                            <p className="text-sm leading-relaxed whitespace-pre-line text-amber-950">
                              {disclaimer.content}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="required" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4 pb-4">
                  {allDisclaimerTypes
                    .filter((type) => LEGAL_DISCLAIMERS[type].required)
                    .map((type) => {
                      const disclaimer = LEGAL_DISCLAIMERS[type]
                      return (
                        <Card key={type} className="border-2 border-amber-300">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-xl font-serif flex items-center gap-2 flex-wrap">
                                  {disclaimer.title}
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="mt-2 flex flex-wrap gap-3 text-xs">
                                  <span>ID: {disclaimer.id}</span>
                                  <span>Version: {disclaimer.version}</span>
                                  <span>Effective: {disclaimer.effectiveDate}</span>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                              <p className="text-sm leading-relaxed whitespace-pre-line text-amber-950">
                                {disclaimer.content}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="info" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6 pb-4">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="w-5 h-5 text-blue-600" />
                        About These Disclaimers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-blue-900">
                      <p>
                        These legal disclaimers are designed to ensure court-defensible compliance and
                        transparency. They define the boundaries of how this educational platform should be
                        used and understood.
                      </p>
                      <p>
                        <strong>Court-Defensible Documentation:</strong> All disclaimers include version
                        numbers, effective dates, and unique identifiers for precise citation and audit trail
                        purposes.
                      </p>
                      <p>
                        <strong>Export Options:</strong> You can export these disclaimers in multiple formats
                        (HTML, Markdown, Plain Text) for documentation, compliance records, or legal filings.
                      </p>
                      <p>
                        <strong>Required vs Optional:</strong> Disclaimers marked as "Required" must be
                        acknowledged before using the application. Optional disclaimers provide additional
                        context and guidance.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Export Formats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-semibold mb-1">HTML</h4>
                        <p className="text-muted-foreground">
                          Formatted document with styling, ideal for web viewing or archival.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Markdown</h4>
                        <p className="text-muted-foreground">
                          Plain text with lightweight formatting, compatible with documentation systems.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Plain Text</h4>
                        <p className="text-muted-foreground">
                          Simple text format, universal compatibility for any system.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Print</h4>
                        <p className="text-muted-foreground">
                          Print directly or save as PDF using your browser's print function.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-6 py-4 border-t shrink-0">
          <Button onClick={() => onOpenChange(false)} size="lg" className="w-full md:w-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
