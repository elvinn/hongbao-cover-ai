'use client'

import { useState, useCallback } from 'react'
import { Download } from 'lucide-react'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'
import { Button } from '@/components/ui/button'
import { downloadCoverByUrl } from '@/utils/download'
import { cn } from '@/utils/tailwind'
import type { GalleryImage } from '@/hooks/use-my-gallery'

interface GalleryCardProps {
  image: GalleryImage
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export function GalleryCard({ image }: GalleryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const prompt = image.generation_tasks?.prompt || '未知提示词'

  const handleDownload = useCallback(() => {
    if (image.url) {
      downloadCoverByUrl(image.url)
    }
  }, [image.url])

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  return (
    <div className="group flex flex-col">
      {/* Cover Image */}
      <RedEnvelopeCover imageUrl={image.url || undefined} className="w-full" />

      {/* Info Section */}
      <div className="mt-3 space-y-2">
        {/* Prompt - click to expand/collapse */}
        <div>
          <span className="text-muted-foreground text-xs">提示词</span>
          <p
            onClick={toggleExpanded}
            className={cn(
              'mt-0.5 cursor-pointer text-sm leading-relaxed transition-all',
              !isExpanded && 'line-clamp-2',
            )}
          >
            {prompt}
          </p>
        </div>

        {/* Date and Download */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {formatDate(image.created_at)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer"
            onClick={handleDownload}
            title="下载封面"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
