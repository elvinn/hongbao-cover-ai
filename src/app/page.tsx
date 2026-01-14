'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CoverPreview } from '@/components/cover-preview'
import { SampleGallery } from '@/components/sample-gallery'
import { GenerationForm } from '@/components/generation-form'
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
  } = useSession()
  const {
    create,
    imageUrl,
    status,
    error: apiError,
    isGenerating,
    isLoading,
    isPolling,
    reset,
  } = useImageGeneration()

  const [generationError, setGenerationError] = useState<string | null>(null)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const coverPreviewRef = useRef<HTMLDivElement>(null)
  const processedTaskIdRef = useRef<string | null>(null)

  const scrollToCoverPreview = useCallback(() => {
    coverPreviewRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  const handleGenerate = useCallback(
    (description: string) => {
      setGenerationError(null)
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
    setTimeout(scrollToCoverPreview, 100)
  }, [refreshUserData, scrollToCoverPreview])

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

  const handleDownload = useCallback(() => {
    if (imageUrl) {
      downloadCoverByUrl(imageUrl)
    }
  }, [imageUrl])

  const handleCreditsExhausted = useCallback(() => {
    setShowCreditsModal(true)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-5xl px-4 py-10 sm:py-14">
        <header className="mb-10 text-center sm:mb-14">
          <h1 className="text-primary mb-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            AI 一键生成微信红包封面
          </h1>
          <p className="hb-section-subtitle mb-2 text-base sm:text-lg">
            新年 / 生日 / 祝福
            <span className="text-primary ml-2">免费</span>
            生成 1 次
          </p>
        </header>

        <div className="mx-auto max-w-2xl space-y-8 sm:space-y-10">
          <div className="hb-card p-6 sm:p-8">
            <GenerationForm
              onGenerate={handleGenerate}
              credits={credits}
              canGenerateMore={canGenerateMore}
              isGenerating={isGenerating}
              isSessionLoading={isSessionLoading}
              isPremium={isPremium}
              onCreditsExhausted={handleCreditsExhausted}
            />

            {displayError && (
              <div className="mt-4 rounded-lg bg-red-50/70 p-3 text-sm text-red-700">
                {displayError}
              </div>
            )}

            {isAuthenticated &&
              !isSessionLoading &&
              !canGenerateMore &&
              !isPremium && (
                <div className="mt-4 rounded-lg bg-amber-50/70 p-4 text-amber-900">
                  <p className="text-sm">生成次数已用完，请购买解锁更多次数</p>
                  <Link
                    href="/pricing"
                    className="text-primary mt-2 inline-block text-sm font-medium underline underline-offset-4 hover:opacity-90"
                  >
                    立即购买 →
                  </Link>
                </div>
              )}
          </div>

          {showCoverPreview && (
            <div ref={coverPreviewRef} className="hb-card p-6 sm:p-8">
              <h2 className="hb-section-title mb-4 text-lg">封面预览</h2>
              <div className="flex flex-col items-center space-y-4">
                <CoverPreview
                  imageUrl={imageUrl}
                  isLoading={false}
                  onDownload={handleDownload}
                />

                {!isPremium && (
                  <div className="w-full rounded-xl border border-amber-200/70 bg-amber-50/70 p-6">
                    <div className="text-center">
                      <p className="mb-3 font-medium text-amber-900">
                        预览版带有水印
                      </p>
                      <p className="mb-4 text-sm text-amber-800">
                        购买套餐解锁高清无水印版本
                      </p>
                      <Link
                        href="/pricing"
                        className="hb-btn-primary inline-block rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors"
                      >
                        查看套餐 →
                      </Link>
                    </div>
                  </div>
                )}

                {isPremium && (
                  <div className="rounded-lg bg-emerald-50/70 p-4 text-center">
                    <p className="text-sm text-emerald-900">
                      您已解锁高清无水印版本，可以直接下载使用
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoadingCover && (
            <div ref={coverPreviewRef} className="hb-card p-6 sm:p-8">
              <h2 className="hb-section-title mb-4 text-lg">封面预览</h2>
              <div className="flex flex-col items-center space-y-4">
                <CoverPreview isLoading={true} />
                <p className="text-muted-foreground text-sm">
                  正在生成封面，请稍候...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-14 sm:mt-16">
          <SampleGallery />
        </div>
      </div>

      <CreditsExhaustedModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
      />
    </main>
  )
}
