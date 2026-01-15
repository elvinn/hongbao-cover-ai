'use client'

import { useState, useCallback, useRef } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

interface LikeButtonProps {
  imageId: string
  initialLikesCount: number
  initialHasLiked: boolean
  className?: string
  variant?: 'default' | 'minimal'
  size?: 'sm' | 'default'
}

export function LikeButton({
  imageId,
  initialLikesCount,
  initialHasLiked,
  className,
  variant = 'default',
  size = 'default',
}: LikeButtonProps) {
  const { isSignedIn } = useAuth()
  const { redirectToSignIn } = useClerk()
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [isLoading, setIsLoading] = useState(false)
  // 用于防止重复点击
  const pendingRef = useRef(false)

  const handleLike = useCallback(async () => {
    // 未登录用户跳转登录
    if (!isSignedIn) {
      redirectToSignIn({
        redirectUrl: `/cover/${imageId}`,
      })
      return
    }

    // 防止重复点击
    if (pendingRef.current) return
    pendingRef.current = true

    // 乐观更新 - 立即更新 UI
    const previousHasLiked = hasLiked
    const previousLikesCount = likesCount
    const newHasLiked = !hasLiked
    const newLikesCount = newHasLiked ? likesCount + 1 : likesCount - 1

    setHasLiked(newHasLiked)
    setLikesCount(newLikesCount)
    setIsLoading(true)

    try {
      const method = previousHasLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/cover/${imageId}/like`, {
        method,
      })

      if (!response.ok) {
        // 请求失败，回滚状态
        setHasLiked(previousHasLiked)
        setLikesCount(previousLikesCount)
        const data = await response.json()
        console.error('Like error:', data.message)
      }
    } catch (error) {
      // 请求失败，回滚状态
      setHasLiked(previousHasLiked)
      setLikesCount(previousLikesCount)
      console.error('Like request failed:', error)
    } finally {
      setIsLoading(false)
      pendingRef.current = false
    }
  }, [imageId, isSignedIn, hasLiked, likesCount, redirectToSignIn])

  if (variant === 'minimal') {
    const isSmall = size === 'sm'
    return (
      <button
        onClick={handleLike}
        className={cn(
          'group flex cursor-pointer items-center transition-all active:scale-95',
          isSmall ? 'gap-1' : 'gap-1.5',
          className,
          // 颜色类放最后，确保覆盖 className 传入的颜色
          hasLiked
            ? 'text-red-500'
            : 'text-muted-foreground hover:text-red-500',
        )}
      >
        <Heart
          className={cn(
            'transition-all group-hover:scale-110',
            isSmall ? 'h-3 w-3' : 'h-5 w-5',
            // 喜欢：实心红色；未喜欢：空心描边
            hasLiked ? 'fill-red-500 text-red-500' : '',
            isLoading && 'animate-pulse',
          )}
        />
        <span
          className={cn(
            'font-medium tabular-nums',
            isSmall ? 'text-[11px]' : 'text-base font-semibold',
          )}
        >
          {likesCount.toLocaleString()}
        </span>
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={handleLike}
      className={cn(
        'group flex h-auto cursor-pointer items-center gap-2 px-4 py-2 transition-all active:scale-95',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-6 w-6 transition-all group-hover:scale-110',
          hasLiked
            ? 'fill-red-500 text-red-500'
            : 'text-muted-foreground group-hover:text-red-500',
          isLoading && 'animate-pulse',
        )}
      />
      <span
        className={cn(
          'text-lg font-semibold tabular-nums transition-colors',
          hasLiked
            ? 'text-red-500'
            : 'text-muted-foreground group-hover:text-red-500',
        )}
      >
        {likesCount.toLocaleString()} 喜欢
      </span>
    </Button>
  )
}
