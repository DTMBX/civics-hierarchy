import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Section, Document } from '@/lib/types'
import { AuthorityBadge, VerificationBadge } from './authority-badge'
import { BookmarkSimple, Copy, ShareNetwork, Check } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface SectionDetailProps {
  section: Section | null
  document?: Document
  open: boolean
  onClose: () => void
  onBookmark?: () => void
}

export function SectionDetail({ section, document, open, onClose, onBookmark }: SectionDetailProps) {
  const [copied, setCopied] = useState(false)

  if (!section || !document) return null

  const handleCopy = async () => {
    const text = `${section.title}\n${section.canonicalCitation}\n\n${section.text}\n\nSource: ${document.title}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Text copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: section.title,
          text: `${section.canonicalCitation}: ${section.text.slice(0, 200)}...`
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopy()
        }
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <SheetTitle className="text-xl leading-tight pr-8">
                {section.title}
              </SheetTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AuthorityBadge level={document.authorityLevel} />
              <VerificationBadge status={document.verificationStatus} />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {document.title}
            </p>
            <p className="text-sm font-bold">
              {section.canonicalCitation}
            </p>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-280px)] mt-6 pr-4">
          <div className="space-y-6">
            <div className="font-serif text-base leading-relaxed whitespace-pre-line">
              {section.text}
            </div>

            {document.sourceUrl && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Official Source
                </p>
                <a
                  href={document.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block break-all"
                >
                  {document.sourceUrl}
                </a>
                {document.lastChecked && (
                  <p className="text-xs text-muted-foreground">
                    Last verified: {new Date(document.lastChecked).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          <div className="flex gap-2">
            {onBookmark && (
              <Button onClick={onBookmark} variant="outline" className="flex-1">
                <BookmarkSimple size={18} />
                Bookmark
              </Button>
            )}
            <Button onClick={handleCopy} variant="outline">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </Button>
            <Button onClick={handleShare} variant="outline">
              <ShareNetwork size={18} />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
