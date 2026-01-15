'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'
import { LikeButton } from '@/components/like-button'
import { ShareButton } from '@/components/share-button'
import type { PublicGalleryImage } from '@/hooks/use-public-gallery'
import { cn } from '@/utils/tailwind'

// 移动端断点（与 Tailwind sm 一致）
const MOBILE_BREAKPOINT = 640

interface PublicGalleryCardProps {
  image: PublicGalleryImage
  className?: string
  priority?: boolean
}

// Format date as YYYY-MM-DD
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function PublicGalleryCard({
  image,
  className,
  priority = false,
}: PublicGalleryCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const prompt = image.prompt || '微信红包封面'
  const altText = image.prompt?.trim()
    ? `红包封面：${image.prompt.trim()}`
    : undefined

  const handlePromptClick = useCallback(() => {
    // 移动端：跳转到详情页
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      router.push(`/cover/${image.id}`)
      return
    }
    // 桌面端：展开/收起
    setIsExpanded((prev) => !prev)
  }, [router, image.id])

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-2 transition-all hover:-translate-y-1 hover:border-red-200/60 hover:shadow-xl hover:shadow-red-500/5',
        className,
      )}
    >
      {/* Cover Image Wrapper - 仅图片可点击跳转 */}
      <Link
        href={`/cover/${image.id}`}
        className="relative aspect-[1/1.65] overflow-hidden rounded-xl bg-slate-100"
      >
        <RedEnvelopeCover
          imageUrl={image.imageUrl}
          alt={altText}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
      </Link>

      {/* Info Section */}
      <div className="flex flex-col gap-1.5 p-2">
        {/* Prompt - 桌面端点击展开/收起，移动端点击跳转详情 */}
        <p
          onClick={handlePromptClick}
          className={cn(
            'cursor-pointer text-xs leading-relaxed font-medium text-slate-600 transition-colors group-hover:text-slate-900',
            !isExpanded && 'line-clamp-2',
          )}
        >
          {prompt}
        </p>

        {/* Footer info */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-1">
          <div className="flex items-center gap-2">
            <LikeButton
              imageId={image.id}
              initialLikesCount={image.likesCount}
              initialHasLiked={image.hasLiked}
              variant="minimal"
              size="sm"
              className="text-slate-400 transition-colors group-hover:text-red-500"
            />
            <ShareButton
              imageId={image.id}
              variant="minimal"
              size="sm"
              className="text-slate-400 transition-colors group-hover:text-red-500"
            />
          </div>
          <span className="text-[10px] text-slate-300">
            {formatDate(image.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
