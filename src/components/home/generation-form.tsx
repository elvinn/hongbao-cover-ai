'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { Loader2, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'
import { type CoverStyle } from '@/types/hongbao'
import { useSession } from '@/hooks/use-session'
import { CreditsExhaustedModal } from '@/components/credits-exhausted-modal'
import {
  cachePromptForAuth,
  getCachedPrompt,
  clearCachedPrompt,
} from '@/utils/prompt-cache'
import { getSavedInput, saveInput as saveInputToStorage } from '@/utils/storage'

interface GenerationFormProps {
  onGenerate: (description: string) => void
  isGenerating?: boolean
  resetSignal?: number
}

export function GenerationForm({
  onGenerate,
  isGenerating = false,
  resetSignal,
}: GenerationFormProps) {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth()
  const { redirectToSignIn } = useClerk()
  const {
    credits,
    isLoading: isSessionLoading,
    accessLevel,
    isAuthenticated,
  } = useSession()
  const canGenerateMore = credits > 0

  // 初始状态设为空（确保 SSR 和客户端一致，避免 hydration 错误）
  const [description, setDescription] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<CoverStyle>('newyear')
  const [error, setError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)
  const [hasTouched, setHasTouched] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)

  const isPremium = accessLevel === 'premium'

  // 在客户端挂载后从 localStorage 读取保存的输入（避免 hydration 错误）
  const hasInitializedRef = useRef(false)
  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    // 使用 queueMicrotask 延迟 setState，避免 ESLint react-hooks/set-state-in-effect 警告
    queueMicrotask(() => {
      // 优先读取缓存的 prompt（用于登录后恢复）
      const cachedPrompt = getCachedPrompt()
      if (cachedPrompt) {
        setDescription(cachedPrompt)
        setCharCount(cachedPrompt.length)
        clearCachedPrompt()
        return
      }

      // 读取保存的输入
      const savedInput = getSavedInput()
      if (savedInput) {
        setDescription(savedInput.description)
        setSelectedStyle(savedInput.style)
        setCharCount(savedInput.description.length)
      }
    })
  }, [])

  // 只在 resetSignal 变化且大于 0 时清空（避免初始值 0 导致清空）
  const prevResetSignalRef = useRef(resetSignal)
  useEffect(() => {
    if (resetSignal === undefined) return
    // 只有当 resetSignal 变化且大于 0 时才执行清空
    if (resetSignal === prevResetSignalRef.current || resetSignal === 0) {
      return
    }
    prevResetSignalRef.current = resetSignal

    const timeout = window.setTimeout(() => {
      setDescription('')
      setCharCount(0)
      setHasTouched(false)
      setError(null)
      clearCachedPrompt()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [resetSignal])

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setDescription(value)
      setCharCount(value.length)
      setHasTouched(true)
      saveInputToStorage(value, selectedStyle)
      setError(null)
    },
    [selectedStyle],
  )

  const handleGenerate = useCallback(() => {
    setError(null)
    const trimmedDescription = description.trim()

    // 如果未登录，直接跳转登录（不验证输入）
    if (!isSignedIn) {
      if (trimmedDescription.length > 0) {
        cachePromptForAuth(trimmedDescription)
      }
      redirectToSignIn({ redirectUrl: '/' })
      return
    }

    // 已登录用户才验证输入
    if (trimmedDescription.length < 4) {
      setError('请输入至少4个字符的描述')
      return
    }

    if (trimmedDescription.length > 500) {
      setError('描述内容过长，请控制在500字符以内')
      return
    }

    // 检查是否还有生成次数
    if (!canGenerateMore) {
      setShowCreditsModal(true)
      return
    }

    onGenerate(trimmedDescription)
  }, [description, isSignedIn, canGenerateMore, onGenerate, redirectToSignIn])

  const isBtnLoading = isGenerating
  const canGenerate = !isBtnLoading && isAuthLoaded

  // 按钮文案
  const getButtonText = () => {
    if (!isAuthLoaded) return '加载中...'
    if (isBtnLoading) return '生成中...'
    return '一键生成'
  }

  return (
    <div className="hb-card relative z-10 p-6 sm:p-8" id="generation-form">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-bold">描绘你的灵感画面</h2>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="例如：红色背景，祥云线条点缀，一只可爱的招财猫..."
            className="border-input/50 bg-background/50 focus-visible:border-primary/50 focus-visible:ring-primary/5 min-h-[120px] w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            rows={4}
            disabled={isBtnLoading}
          />
          <div className="text-muted-foreground flex justify-between px-1 text-xs">
            <span>
              {hasTouched && charCount < 4 ? (
                <span className="text-destructive font-medium">
                  至少需要 4 个字符
                </span>
              ) : (
                '描述越清晰，生成的封面越精美'
              )}
            </span>
            <span className={cn(charCount > 500 ? 'text-destructive' : '')}>
              {charCount}/500
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl p-4 text-sm font-medium">
            <span className="bg-destructive h-1.5 w-1.5 shrink-0 rounded-full" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-muted-foreground text-sm font-medium">
            {isSignedIn && (
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>
                  剩余生成次数:{' '}
                  <span className="text-foreground">
                    {isSessionLoading ? '-' : credits}
                  </span>
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            size="lg"
            className="shadow-primary/20 h-12 rounded-xl px-8 font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isBtnLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        </div>
      </div>

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

      <CreditsExhaustedModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
      />
    </div>
  )
}
