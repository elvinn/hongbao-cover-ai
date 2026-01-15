import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'
import { LikeButton } from '@/components/like-button'
import { ShareButton } from '@/components/share-button'
import { CoverBackButton } from '@/components/cover-back-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fetchCoverDetail } from '@/services/gallery'

interface PageProps {
  params: Promise<{ imageId: string }>
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default async function CoverDetailPage({ params }: PageProps) {
  const { imageId } = await params
  const { userId } = await auth()

  // 在服务端获取封面详情
  const result = await fetchCoverDetail(imageId, userId)

  // Not found or error
  if (!result.success) {
    if (result.error === 'NOT_FOUND') {
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

    // Server error
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-2xl font-semibold">
            加载失败
          </h1>
          <p className="text-muted-foreground mb-6">{result.message}</p>
          <Button asChild variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </main>
    )
  }

  const cover = result.data

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Back Button */}
        <div className="mb-8 flex">
          <CoverBackButton />
        </div>

        {/* Main content - responsive layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          {/* Left: Cover image */}
          <div className="flex flex-col items-center justify-start lg:items-end">
            <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
              <div className="group relative">
                {/* Image Glow */}
                <div className="absolute -inset-4 rounded-[2rem] bg-red-500/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <RedEnvelopeCover
                  imageUrl={cover.imageUrl}
                  className="relative w-full rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                  priority
                />
              </div>

              {/* Mobile-only Action Buttons */}
              <div className="mt-8 flex w-full flex-col gap-3 lg:hidden">
                <Button
                  asChild
                  size="lg"
                  className="hb-btn-primary w-full py-6"
                >
                  <Link href="/">
                    <Sparkles className="mr-2 h-5 w-5" />
                    我也要生成
                  </Link>
                </Button>
                <ShareButton imageId={cover.id} className="w-full py-6" />
              </div>
            </div>
          </div>

          {/* Right: Info section */}
          <div className="flex flex-col gap-6">
            <Card className="border-slate-200/60 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="cursor-default bg-red-100 text-red-600 hover:bg-red-100"
                  >
                    红包封面详情
                  </Badge>
                  <LikeButton
                    imageId={cover.id}
                    initialLikesCount={cover.likesCount}
                    initialHasLiked={cover.hasLiked}
                    variant="minimal"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Creator info */}
                <div className="flex items-center gap-4">
                  {cover.creator.avatarUrl ? (
                    <div className="ring-offset-background relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-red-100 transition-transform hover:scale-105">
                      <Image
                        src={cover.creator.avatarUrl}
                        alt={cover.creator.nickname}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full ring-2 ring-slate-100">
                      <User className="text-muted-foreground h-7 w-7" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-foreground text-xl font-bold tracking-tight">
                      {cover.creator.nickname}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      创建于 {formatDate(cover.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Prompt */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-red-500" />
                    <h2 className="text-foreground text-base font-semibold">
                      设计描述
                    </h2>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-foreground text-base leading-relaxed break-all italic opacity-90">
                      &quot;{cover.prompt || '暂无描述'}&quot;
                    </p>
                  </div>
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden flex-col gap-4 pt-4 lg:flex">
                  <Button
                    asChild
                    size="lg"
                    className="hb-btn-primary h-14 w-full text-lg shadow-lg shadow-red-500/20"
                  >
                    <Link href="/">
                      <Sparkles className="mr-2 h-5 w-5" />
                      我也要生成
                    </Link>
                  </Button>

                  <ShareButton
                    imageId={cover.id}
                    className="h-14 w-full text-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional info */}
            <div className="text-muted-foreground/60 mt-2 text-center text-xs">
              提示：生成的封面图片归创建者所有，请遵循相关法律法规使用。
            </div>
          </div>
        </div>

        {/* Cover Navigation */}
        <nav
          className="mt-12 flex items-center justify-center gap-3"
          aria-label="封面导航"
        >
          {/* Previous Button */}
          {cover.navigation.prevId ? (
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href={`/cover/${cover.navigation.prevId}`}>
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">上一张</span>
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="lg" className="gap-2" disabled>
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">上一张</span>
            </Button>
          )}

          {/* Random Button */}
          {cover.navigation.randomId ? (
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href={`/cover/${cover.navigation.randomId}`}>
                <Shuffle className="h-5 w-5" />
                <span className="hidden sm:inline">随机</span>
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="lg" className="gap-2" disabled>
              <Shuffle className="h-5 w-5" />
              <span className="hidden sm:inline">随机</span>
            </Button>
          )}

          {/* Next Button */}
          {cover.navigation.nextId ? (
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href={`/cover/${cover.navigation.nextId}`}>
                <span className="hidden sm:inline">下一张</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="lg" className="gap-2" disabled>
              <span className="hidden sm:inline">下一张</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </nav>
      </div>
    </main>
  )
}
