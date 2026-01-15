'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Sparkles, User } from 'lucide-react'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'
import { LikeButton } from '@/components/like-button'
import { ShareButton } from '@/components/share-button'
import { Button } from '@/components/ui/button'

interface Creator {
  nickname: string
  avatarUrl: string | null
}

interface CoverDetail {
  id: string
  imageUrl: string
  prompt: string
  likesCount: number
  hasLiked: boolean
  isOwner: boolean
  createdAt: string
  creator: Creator
}

export default function CoverDetailPage() {
  const params = useParams()
  const imageId = params.imageId as string

  const [cover, setCover] = useState<CoverDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCoverDetail() {
      try {
        const response = await fetch(`/api/cover/${imageId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('NOT_FOUND')
          } else {
            const data = await response.json()
            setError(data.message || '加载失败')
          }
          return
        }

        const data = await response.json()
        setCover(data)
      } catch (err) {
        console.error('Failed to fetch cover:', err)
        setError('加载失败，请稍后重试')
      } finally {
        setIsLoading(false)
      }
    }

    if (imageId) {
      fetchCoverDetail()
    }
  }, [imageId])

  // Loading state
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </main>
    )
  }

  // Not found
  if (error === 'NOT_FOUND' || !cover) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-2xl font-semibold">
            封面不存在
          </h1>
          <p className="text-muted-foreground mb-6">
            该封面可能已被删除或设为私有
          </p>
          <Button asChild className="hb-btn-primary">
            <Link href="/">
              <Sparkles className="mr-2 h-4 w-4" />
              去生成我的封面
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-2xl font-semibold">
            加载失败
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Main content - responsive layout */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Cover image */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-xs sm:max-w-sm">
              <RedEnvelopeCover
                imageUrl={cover.imageUrl}
                className="w-full shadow-lg"
              />
            </div>
          </div>

          {/* Right: Info section */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Creator info */}
            <div className="flex items-center gap-3">
              {cover.creator.avatarUrl ? (
                <Image
                  src={cover.creator.avatarUrl}
                  alt={cover.creator.nickname}
                  width={48}
                  height={48}
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                  <User className="text-muted-foreground h-6 w-6" />
                </div>
              )}
              <div>
                <p className="text-foreground text-lg font-medium">
                  {cover.creator.nickname}
                </p>
                <p className="text-muted-foreground text-sm">
                  创建于 {formatDate(cover.createdAt)}
                </p>
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-3">
              <h2 className="text-foreground text-base font-medium">提示词</h2>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-foreground text-base leading-relaxed">
                  {cover.prompt || '暂无描述'}
                </p>
              </div>
            </div>

            {/* Like section */}
            <div className="space-y-3">
              <h2 className="text-foreground text-base font-medium">点赞</h2>
              <LikeButton
                imageId={cover.id}
                initialLikesCount={cover.likesCount}
                initialHasLiked={cover.hasLiked}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="hb-btn-primary min-h-[32px] flex-1 py-3 text-base"
              >
                <Link href="/">
                  <Sparkles className="mr-2 h-4 w-4" />
                  我也要生成
                </Link>
              </Button>

              <ShareButton
                imageId={cover.id}
                className="min-h-[32px] flex-1 py-3 text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
