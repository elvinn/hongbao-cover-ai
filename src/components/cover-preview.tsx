'use client'

import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'

interface CoverPreviewProps {
  imageUrl?: string | null
  isLoading?: boolean
  error?: string | null
  onDownload?: () => void
}

export function CoverPreview({
  imageUrl,
  isLoading = false,
  error,
  onDownload,
}: CoverPreviewProps) {
  if (isLoading) {
    return (
      <div className="bg-muted flex aspect-3/4 w-[300px] animate-pulse items-center justify-center rounded-lg">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-destructive/20 bg-destructive/10 flex aspect-3/4 w-[300px] flex-col items-center justify-center rounded-lg border-2 p-4">
        <p className="text-destructive text-center text-sm">{error}</p>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="border-muted-foreground/25 bg-muted/50 flex aspect-3/4 w-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground text-sm">封面将显示在这里</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[400px]">
      <RedEnvelopeCover imageUrl={imageUrl} className="w-full" />
      {onDownload && (
        <Button className="mt-4 w-full" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          下载封面
        </Button>
      )}
    </div>
  )
}
