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
}

export function LikeButton({
  imageId,
  initialLikesCount,
  initialHasLiked,
  className,
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

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={handleLike}
      className={cn(
        'group flex h-auto cursor-pointer items-center gap-2 px-4 py-2',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-7 w-7 transition-all',
          hasLiked
            ? 'fill-red-500 text-red-500'
            : 'text-muted-foreground group-hover:text-red-400',
          isLoading && 'animate-pulse',
        )}
      />
      <span
        className={cn(
          'text-xl font-medium',
          hasLiked ? 'text-red-500' : 'text-muted-foreground',
        )}
      >
        {likesCount.toLocaleString()} 喜欢
      </span>
    </Button>
  )
}
