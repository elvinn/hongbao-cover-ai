'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Download, Globe, Lock, Loader2, Calendar, Check } from 'lucide-react'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'
import { downloadCoverByUrl } from '@/utils/download'
import { cn } from '@/utils/tailwind'
import type { GalleryImage } from '@/hooks/use-my-gallery'

interface GalleryCardProps {
  image: GalleryImage
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function GalleryCard({ image }: GalleryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPublic, setIsPublic] = useState(image.is_public)
  const [isUpdating, setIsUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  const prompt = image.generation_tasks?.prompt || '微信红包封面'

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (image.url) {
        downloadCoverByUrl(image.url)
      }
    },
    [image.url],
  )

  const toggleExpanded = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded((prev) => !prev)
  }, [])

  const copyToClipboard = useCallback(async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://hongbao.elvinn.wiki'
    const shareUrl = `${SITE_URL}/cover/${image.id}`
    const shareText = `🧧 AI 生成了一个超好看的红包封面！\n快来看看 → ${shareUrl}\n你也可以免费生成属于自己的红包封面~`

    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [image.id])

  const togglePublic = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isUpdating) return

      const oldValue = isPublic
      const newValue = !oldValue

      // Optimistic update
      setIsPublic(newValue)
      setIsUpdating(true)

      try {
        const response = await fetch(`/api/user/images/${image.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_public: newValue }),
        })

        if (!response.ok) {
          throw new Error('Failed to update public status')
        }

        // If just published to public, copy to clipboard
        if (newValue) {
          copyToClipboard()
        }
      } catch (error) {
        console.error('Failed to update public status:', error)
        // Rollback
        setIsPublic(oldValue)
      } finally {
        setIsUpdating(false)
      }
    },
    [image.id, isPublic, isUpdating, copyToClipboard],
  )

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-2 transition-all hover:-translate-y-1 hover:border-red-200/60 hover:shadow-xl hover:shadow-red-500/5',
      )}
    >
      {/* Cover Image Wrapper */}
      <Link
        href={`/cover/${image.id}`}
        className="relative block aspect-[1/1.65] overflow-hidden rounded-xl bg-slate-100"
      >
        <RedEnvelopeCover
          imageUrl={image.url || undefined}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Visibility Overlay */}
        <div className="absolute top-2 left-2">
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shadow-sm backdrop-blur-sm transition-all',
              isPublic
                ? 'bg-emerald-500/90 text-white'
                : 'bg-slate-700/80 text-white',
            )}
          >
            {isPublic ? (
              <Globe className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            {isPublic ? '公开' : '私密'}
          </div>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleDownload}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-red-600"
            title="下载封面"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </Link>

      {/* Info Section */}
      <div className="flex flex-col gap-2 p-2">
        {/* Prompt - truncated */}
        <div onClick={toggleExpanded} className="min-h-10 cursor-pointer">
          <p
            className={cn(
              'text-xs leading-relaxed font-medium text-slate-600 transition-colors group-hover:text-slate-900',
              !isExpanded && 'line-clamp-2',
            )}
          >
            {prompt}
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-auto flex flex-col gap-2 border-t border-slate-50 pt-2">
          {/* Public Toggle Button */}
          <button
            onClick={togglePublic}
            disabled={isUpdating}
            className={cn(
              'flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all active:scale-95',
              isPublic
                ? 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                : 'bg-red-50 text-red-600 hover:bg-red-100',
              copied &&
                'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
              isUpdating && 'opacity-80',
            )}
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : copied ? (
              <Check className="h-3 w-3" />
            ) : isPublic ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Globe className="h-3 w-3" />
            )}
            <span>
              {isUpdating
                ? '处理中...'
                : copied
                  ? '已公开并复制链接'
                  : isPublic
                    ? '设为私密'
                    : '公开到广场'}
            </span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px]">
                {formatDate(image.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
