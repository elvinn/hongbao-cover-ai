'use client'

import { useCallback } from 'react'
import { Share, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

interface ShareButtonProps {
  imageId: string
  className?: string
  variant?: 'default' | 'minimal'
  size?: 'sm' | 'default'
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hongbao.elvinn.wiki'

export function ShareButton({
  imageId,
  className,
  variant = 'default',
  size = 'default',
}: ShareButtonProps) {
  const handleShare = useCallback(async () => {
    const shareUrl = `${SITE_URL}/cover/${imageId}`
    const shareText = `🧧 AI 生成了一个超好看的红包封面！
快来看看 → ${shareUrl}
你也可以免费生成属于自己的红包封面~`

    try {
      await navigator.clipboard.writeText(shareText)
      toast.success('已复制，快去分享吧！', {
        icon: <Check className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      toast.success('已复制，快去分享吧！', {
        icon: <Check className="h-4 w-4" />,
      })
    }
  }, [imageId])

  // Minimal variant - 用于卡片等紧凑场景
  if (variant === 'minimal') {
    const isSmall = size === 'sm'
    return (
      <button
        onClick={handleShare}
        className={cn(
          'group flex cursor-pointer items-center transition-all active:scale-95',
          isSmall ? 'gap-1' : 'gap-1.5',
          'text-muted-foreground hover:text-red-500',
          className,
        )}
        title="分享"
      >
        <Share
          className={cn(
            'transition-all group-hover:scale-110',
            isSmall ? 'h-3 w-3' : 'h-5 w-5',
          )}
        />
      </button>
    )
  }

  // Default variant - 用于详情页等宽松场景
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleShare}
      className={cn(
        'cursor-pointer gap-2 transition-all active:scale-95',
        className,
      )}
    >
      <Share className="h-4 w-4" />
      分享
    </Button>
  )
}
