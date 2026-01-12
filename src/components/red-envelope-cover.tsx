'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/utils/tailwind'

interface RedEnvelopeCoverProps {
  imageUrl?: string
  width?: number
  className?: string
}

const ASPECT_RATIO = 4 / 7

export function RedEnvelopeCover({
  imageUrl = '',
  width,
  className,
}: RedEnvelopeCoverProps) {
  const [isCoverLoaded, setIsCoverLoaded] = useState(false)
  const [isCoverError, setIsCoverError] = useState(false)

  const isLoading = imageUrl && !isCoverLoaded && !isCoverError
  const height = width ? Math.round(width / ASPECT_RATIO) : undefined
  const style = width ? { width, height } : undefined

  return (
    <div
      className={cn(
        'relative aspect-4/7 overflow-hidden rounded-lg',
        className,
      )}
      style={style}
    >
      {(isLoading || !imageUrl || isCoverError) && (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          {isLoading && (
            <span className="text-muted-foreground text-xs">加载中...</span>
          )}
        </div>
      )}

      {imageUrl && (
        <Image
          src={imageUrl}
          alt="红包封面"
          fill
          className={cn(
            'object-cover object-top transition-opacity duration-300',
            isCoverLoaded ? 'opacity-100' : 'opacity-0',
          )}
          unoptimized
          onLoad={() => {
            setIsCoverLoaded(true)
          }}
          onError={() => setIsCoverError(true)}
        />
      )}

      <div className="absolute right-0 bottom-0 left-0 h-[30%]">
        <Image
          src="/images/hb_bottom.png"
          alt="红包底部"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    </div>
  )
}
