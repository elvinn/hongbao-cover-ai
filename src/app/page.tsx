'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  Wand2,
  Smartphone,
  Zap,
  CheckCircle2,
  Download,
  ShieldCheck,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/utils/tailwind'
import { CoverPreview } from '@/components/cover-preview'
import { SampleGallery } from '@/components/sample-gallery'
import { GenerationForm } from '@/components/generation-form'
import { ShareButton } from '@/components/share-button'
import { CreditsExhaustedModal } from '@/components/credits-exhausted-modal'
import { useSession } from '@/hooks/use-session'
import { useImageGeneration } from '@/hooks/use-image-generation'
import { downloadCoverByUrl } from '@/utils/download'

export default function Home() {
  const {
    credits,
    accessLevel,
    isLoading: isSessionLoading,
    isAuthenticated,
    refreshUserData,
    clearInput,
  } = useSession()
  const {
    create,
    imageUrl,
    imageId,
    status,
    error: apiError,
    isGenerating,
    isLoading,
    isPolling,
    reset,
  } = useImageGeneration()

  const [generationError, setGenerationError] = useState<string | null>(null)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [formResetSignal, setFormResetSignal] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showResultHighlight, setShowResultHighlight] = useState(false)
  const coverTitleRef = useRef<HTMLHeadingElement>(null)
  const processedTaskIdRef = useRef<string | null>(null)
  const highlightTimeoutRef = useRef<number | null>(null)
  const hasScrolledToLoadingRef = useRef(false)

  const scrollToCoverPreview = useCallback(() => {
    const target = coverTitleRef.current
    if (!target) return
    const top = target.getBoundingClientRect().top + window.scrollY - 128
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const handleGenerate = useCallback(
    (description: string) => {
      setGenerationError(null)
      setShowResultHighlight(false)
      reset()
      create(description)
    },
    [create, reset],
  )

  const handleGenerateSuccess = useCallback(async () => {
    // Credits are now deducted on the backend during generation
    // Just refresh user data to update the display
    await refreshUserData()
    setGenerationError(null)
    clearInput()
    setFormResetSignal((prev) => prev + 1)
    setShowResultHighlight(true)
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current)
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setShowResultHighlight(false)
      highlightTimeoutRef.current = null
    }, 1600)
    setTimeout(scrollToCoverPreview, 100)
  }, [clearInput, refreshUserData, scrollToCoverPreview])

  useEffect(() => {
    if (
      status === 'SUCCEEDED' &&
      imageUrl &&
      processedTaskIdRef.current !== imageUrl
    ) {
      processedTaskIdRef.current = imageUrl
      // 使用 queueMicrotask 避免在 effect 中同步调用 setState
      queueMicrotask(() => {
        handleGenerateSuccess()
      })
    }
  }, [status, imageUrl, handleGenerateSuccess])

  const isPremium = accessLevel === 'premium'
  const canGenerateMore = credits > 0
  const displayError =
    generationError || (status === 'FAILED' ? apiError : null)
  const showCoverPreview = status === 'SUCCEEDED' && imageUrl
  const isLoadingCover =
    status === 'PENDING' || status === 'PROCESSING' || isLoading || isPolling

  useEffect(() => {
    if (isLoadingCover && !hasScrolledToLoadingRef.current) {
      hasScrolledToLoadingRef.current = true
      setTimeout(scrollToCoverPreview, 100)
    }

    if (!isLoadingCover) {
      hasScrolledToLoadingRef.current = false
    }
  }, [isLoadingCover, scrollToCoverPreview])

  useEffect(() => {
    if (!isLoadingCover) {
      const timeout = window.setTimeout(() => {
        setLoadingProgress(0)
      }, 0)
      return () => {
        window.clearTimeout(timeout)
      }
    }

    const startTime = Date.now()
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const nextProgress = Math.min(97, Math.floor((elapsed / 10000) * 100))
      setLoadingProgress(nextProgress)
    }, 800)

    return () => {
      window.clearInterval(interval)
    }
  }, [isLoadingCover])

  const handleDownload = useCallback(() => {
    if (imageUrl) {
      downloadCoverByUrl(imageUrl)
    }
  }, [imageUrl])

  const handleCreditsExhausted = useCallback(() => {
    setShowCreditsModal(true)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden">
      {/* Hero Section */}
      <div className="relative container max-w-5xl px-4 py-16 sm:py-24">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[120px] [background:radial-gradient(circle_farthest-side,rgba(220,38,38,0.15),transparent)]" />

        <header className="relative mb-12 text-center sm:mb-20">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-red-200/50 bg-red-50/50 px-4 py-1.5 text-sm font-medium text-red-700 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>2026 贺岁版正式上线</span>
          </div>

          <h1 className="text-primary mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            把祝福，变成封面
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
            用一句话，生成你的专属红包封面
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>免费体验</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>完美适配</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>高清无水印</span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-2xl space-y-12 sm:space-y-16">
          <div className="hb-card relative z-10 p-6 sm:p-8">
            <GenerationForm
              onGenerate={handleGenerate}
              credits={credits}
              canGenerateMore={canGenerateMore}
              isGenerating={isGenerating}
              isSessionLoading={isSessionLoading}
              isPremium={isPremium}
              onCreditsExhausted={handleCreditsExhausted}
              resetSignal={formResetSignal}
            />

            {displayError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50/70 p-3 text-sm text-red-700">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
                {displayError}
              </div>
            )}

            {isAuthenticated &&
              !isSessionLoading &&
              !canGenerateMore &&
              !isPremium && (
                <div className="mt-6 rounded-xl border border-amber-200/50 bg-amber-50/50 p-5 text-amber-900 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <Zap className="mt-0.5 h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium">生成次数已用完</p>
                      <p className="mt-1 text-sm opacity-80">
                        解锁高级版，享受无限生成与水印移除
                      </p>
                      <Link
                        href="/pricing"
                        className="text-primary mt-3 flex items-center gap-1 text-sm font-semibold hover:opacity-80"
                      >
                        立即购买套餐 <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {showCoverPreview && (
            <div
              className={cn(
                'hb-card animate-in fade-in slide-in-from-bottom-4 p-6 duration-500 sm:p-8',
                showResultHighlight &&
                  'ring-primary/30 shadow-primary/20 shadow-2xl ring-2',
              )}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 ref={coverTitleRef} className="text-xl font-semibold">
                  生成结果
                </h2>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                    AI 已完成
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <CoverPreview
                  imageUrl={imageUrl}
                  isLoading={false}
                  onDownload={handleDownload}
                />

                {!isPremium ? (
                  <div className="w-full rounded-2xl border border-amber-200/50 bg-amber-50/50 p-6 text-center backdrop-blur-sm">
                    <p className="mb-2 font-semibold text-amber-900">
                      ✨ 预览版带有水印
                    </p>
                    <p className="mb-6 text-sm text-amber-800">
                      购买高级版套餐，即可获取高清无水印原图
                    </p>
                    <Link
                      href="/pricing"
                      className="hb-btn-primary inline-flex h-11 items-center justify-center rounded-xl px-8 text-sm font-bold text-white shadow-lg shadow-red-500/20"
                    >
                      查看价格方案
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50/50 px-6 py-3 text-sm font-medium text-emerald-900 backdrop-blur-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    你已解锁高清无水印版本，可直接下载
                  </div>
                )}

                {imageId && (
                  <div className="w-full">
                    <ShareButton
                      imageId={imageId}
                      className="h-11 w-full rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoadingCover && (
            <div className="hb-card p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 ref={coverTitleRef} className="text-xl font-semibold">
                  正在生成...
                </h2>
                <Loader2 className="text-primary h-5 w-5 animate-spin" />
              </div>
              <div className="flex flex-col items-center space-y-6">
                <CoverPreview
                  isLoading={true}
                  loadingProgress={loadingProgress}
                />
              </div>
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
            <SampleGallery />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="relative w-full overflow-hidden border-y border-red-100/30 bg-white/40 py-20 sm:py-24">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              简单 3 步，拥有专属封面
            </h2>
            <p className="text-muted-foreground">
              无需设计基础，人人都是设计师
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            {/* Desktop Connector Line */}
            <div className="absolute top-5 right-[16.6%] left-[16.6%] hidden h-px bg-slate-200 sm:block" />

            <div className="grid gap-12 sm:grid-cols-3 sm:gap-4">
              {[
                {
                  step: '1',
                  title: '输入描述',
                  desc: '用文字描述你想要的画面，如“红金配色的锦鲤”',
                },
                {
                  step: '2',
                  title: 'AI 创作',
                  desc: 'AI 深度理解语义，快速生成多款精美封面图',
                },
                {
                  step: '3',
                  title: '下载使用',
                  desc: '获取高清原图，通过微信红包封面平台提交审核',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group relative flex flex-row items-start gap-4 sm:flex-col sm:items-center sm:text-center"
                >
                  {/* Mobile Connector Line */}
                  {idx !== 2 && (
                    <div className="absolute top-10 bottom-[-48px] left-5 w-px bg-slate-200 sm:hidden" />
                  )}

                  <div className="group-hover:border-primary group-hover:text-primary relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-900 shadow-xs transition-all duration-300">
                    {item.step}
                  </div>

                  <div className="pt-1 sm:pt-2">
                    <h3 className="group-hover:text-primary mb-2 text-lg font-bold text-slate-900 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed sm:px-4">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="w-full py-20 sm:py-24">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-16 sm:grid-cols-2 sm:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                不止是美，更懂
                <br />
                微信红包封面规范
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: '精准尺寸匹配',
                    desc: '严格遵守官方规范，确保封面在红包展开、拆开各环节完美适配。',
                    icon: Smartphone,
                  },
                  {
                    title: 'AI 驱动',
                    desc: '基于领先的生成式 AI，理解力更强，支持多种艺术风格创作。',
                    icon: Zap,
                  },
                  {
                    title: '版权安全保障',
                    desc: 'AI 原创生成，避开网络素材版权风险，让你的封面独一无二。',
                    icon: ShieldCheck,
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              {/* WeChat Red Envelope Style Mockup */}
              <div className="relative w-48 sm:w-56">
                {/* Red Envelope Body */}
                <div className="relative aspect-4/7 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
                  {/* Base Cover Image */}
                  <Image
                    src="https://cdn.hongbao.elvinn.wiki/public/official.jpg"
                    alt="红包封面预览"
                    fill
                    sizes="(max-width: 640px) 12rem, 14rem"
                    className="absolute inset-0 h-full w-full object-cover"
                    unoptimized
                  />

                  {/* Bottom Flap Overlay (containing the 'Open' button style) */}
                  <Image
                    src="https://cdn.hongbao.elvinn.wiki/public/official-bottom.png"
                    alt="红包底部"
                    fill
                    sizes="(max-width: 640px) 12rem, 14rem"
                    className="absolute bottom-0 left-0 w-full object-contain object-bottom"
                    unoptimized
                  />

                  {/* Glass Reflection Effect */}
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Snippet Section */}
      <section className="border-border/40 w-full border-t bg-white/40 py-20 sm:py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">常见疑问</h2>
            <p className="text-muted-foreground">快速了解红包封面 AI</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: '生成的封面可以直接在微信使用吗？',
                a: '是的。生成的图片完全符合微信 957×1278 的尺寸要求。你下载原图后，只需在微信红包封面开放平台提交审核即可。',
              },
              {
                q: '审核一般需要多久？',
                a: '微信官方审核通常需要 1-3 个工作日。建议你提前制作，以免错过节日。',
              },
              {
                q: '水印如何去除？',
                a: '购买任意高级版套餐后，生成的所有封面都将自动移除水印，并提供最高清的原图下载。',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border-border/40 rounded-2xl border bg-white p-6 shadow-sm"
              >
                <h3 className="mb-3 flex items-center gap-2 font-bold">
                  <HelpCircle className="text-primary h-4 w-4" />
                  {faq.q}
                </h3>
                <p className="text-muted-foreground pl-6 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="text-muted-foreground hover:text-primary text-sm font-medium underline underline-offset-4"
            >
              查看完整帮助中心 →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative w-full overflow-hidden py-24 sm:py-32">
        <div className="bg-primary absolute inset-0 -z-10" />
        <div className="absolute top-0 left-0 h-full w-full opacity-10 [background:radial-gradient(circle_at_center,#fff,transparent_70%)]" />

        <div className="relative container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            现在就开始制作
            <br />
            你的专属红包封面
          </h2>
          <p className="mb-10 text-lg text-white/80">
            送出独一无二的祝福，让你的红包在群聊中脱颖而出。
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-primary inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 text-lg font-bold shadow-xl transition-transform hover:scale-105"
            >
              立即免费生成
            </button>
            <Link
              href="/gallery"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-10 text-lg font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              浏览灵感广场
            </Link>
          </div>
        </div>
      </section>

      <CreditsExhaustedModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
      />
    </main>
  )
}
