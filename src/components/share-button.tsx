'use client'

import { useState, useCallback } from 'react'
import { Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

interface ShareButtonProps {
  imageId: string
  className?: string
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hongbao.elvinn.wiki'

export function ShareButton({ imageId, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const shareUrl = `${SITE_URL}/cover/${imageId}`
    const shareText = `🧧 AI 生成了一个超好看的红包封面！
快来看看 → ${shareUrl}
你也可以免费生成属于自己的红包封面~`

    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [imageId])

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleShare}
      className={cn(
        'cursor-pointer gap-2',
        copied && 'border-green-500 text-green-600',
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          已复制分享文案
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          分享
        </>
      )}
    </Button>
  )
}
