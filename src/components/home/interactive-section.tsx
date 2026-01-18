'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/utils/tailwind'
import { CoverPreview } from '@/components/cover-preview'
import { ShareButton } from '@/components/share-button'
import { useSession } from '@/hooks/use-session'
import { useImageGeneration } from '@/hooks/use-image-generation'
import { downloadCoverByUrl } from '@/utils/download'
import { clearInput } from '@/utils/storage'
import { GenerationForm } from './generation-form'

export function InteractiveSection() {
  const { accessLevel, refreshUserData } = useSession()
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
  }, [refreshUserData, scrollToCoverPreview])

  useEffect(() => {
    if (
      status === 'SUCCEEDED' &&
      imageUrl &&
      processedTaskIdRef.current !== imageUrl
    ) {
      processedTaskIdRef.current = imageUrl
      queueMicrotask(() => {
        handleGenerateSuccess()
      })
    }
  }, [status, imageUrl, handleGenerateSuccess])

  const isPremium = accessLevel === 'premium'
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

  return (
    <>
      <GenerationForm
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        resetSignal={formResetSignal}
      />

      {displayError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50/70 p-3 text-sm text-red-700">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
          {displayError}
        </div>
      )}

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
            <CoverPreview isLoading={true} loadingProgress={loadingProgress} />
          </div>
        </div>
      )}
    </>
  )
}
