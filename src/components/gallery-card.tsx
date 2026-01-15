'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Download, Globe, Lock, Loader2 } from 'lucide-react'
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
  const [isPublic, setIsPublic] = useState(image.is_public)
  const [isUpdating, setIsUpdating] = useState(false)
  const prompt = image.generation_tasks?.prompt || '未知提示词'

  const handleDownload = useCallback(() => {
    if (image.url) {
      downloadCoverByUrl(image.url)
    }
  }, [image.url])

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const togglePublic = useCallback(async () => {
    if (isUpdating) return

    setIsUpdating(true)
    const newValue = !isPublic

    try {
      const response = await fetch(`/api/user/images/${image.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: newValue }),
      })

      if (response.ok) {
        setIsPublic(newValue)
      } else {
        console.error('Failed to update public status')
      }
    } catch (error) {
      console.error('Failed to update public status:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [image.id, isPublic, isUpdating])

  return (
    <div className="group flex flex-col">
      {/* Cover Image - click to view detail if public */}
      {isPublic ? (
        <Link href={`/cover/${image.id}`} className="block">
          <RedEnvelopeCover
            imageUrl={image.url || undefined}
            className="w-full transition-transform hover:scale-[1.02]"
          />
        </Link>
      ) : (
        <RedEnvelopeCover
          imageUrl={image.url || undefined}
          className="w-full"
        />
      )}

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

        {/* Public Toggle */}
        <button
          onClick={togglePublic}
          disabled={isUpdating}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
            isPublic
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
            isUpdating && 'cursor-not-allowed opacity-50',
          )}
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPublic ? (
            <Globe className="h-3.5 w-3.5" />
          ) : (
            <Lock className="h-3.5 w-3.5" />
          )}
          <span>{isPublic ? '已公开到广场' : '仅自己可见'}</span>
        </button>

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
