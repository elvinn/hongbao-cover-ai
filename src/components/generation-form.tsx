'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'
import { type CoverStyle } from '@/types/hongbao'
import { useSession } from '@/hooks/use-session'
import {
  cachePromptForAuth,
  getCachedPrompt,
  clearCachedPrompt,
} from '@/utils/prompt-cache'

interface GenerationFormProps {
  onGenerate: (description: string) => void
  disabled?: boolean
  credits: number
  canGenerateMore: boolean
  isGenerating?: boolean
  isSessionLoading?: boolean
  initialPrompt?: string
  initialStyle?: CoverStyle
  descriptionRef?: React.RefObject<HTMLTextAreaElement | null>
  isPremium?: boolean
  onCreditsExhausted?: () => void
  resetSignal?: number
}

export function GenerationForm({
  onGenerate,
  disabled = false,
  credits,
  canGenerateMore,
  isGenerating = false,
  isSessionLoading = false,
  initialPrompt = '',
  initialStyle = 'newyear',
  descriptionRef,
  isPremium = false,
  onCreditsExhausted,
  resetSignal,
}: GenerationFormProps) {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth()
  const { redirectToSignIn } = useClerk()
  const { savedInput, saveInput } = useSession()

  // 在初始化时检查并恢复缓存的提示词
  const [description, setDescription] = useState(() => {
    const cachedPrompt = getCachedPrompt()
    if (cachedPrompt) return cachedPrompt
    if (savedInput?.description) return savedInput.description
    return initialPrompt
  })
  const [selectedStyle, setSelectedStyle] = useState(() => {
    if (savedInput?.style) return savedInput.style
    return initialStyle
  })
  const [error, setError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(() => {
    const cachedPrompt = getCachedPrompt()
    if (cachedPrompt) return cachedPrompt.length
    if (savedInput?.description) return savedInput.description.length
    return initialPrompt.length
  })
  const [hasTouched, setHasTouched] = useState(false)
  const [prevSavedDescription, setPrevSavedDescription] = useState(
    savedInput?.description,
  )

  // 清除已使用的缓存（只在挂载时执行）
  const hasClearedCacheRef = useRef(false)
  useEffect(() => {
    if (!hasClearedCacheRef.current && getCachedPrompt()) {
      clearCachedPrompt()
      hasClearedCacheRef.current = true
    }
  }, [])

  // 当 savedInput 变化时同步状态（React 推荐的模式：在渲染期间更新状态）
  if (
    !hasTouched &&
    savedInput?.description &&
    savedInput.description !== prevSavedDescription
  ) {
    setPrevSavedDescription(savedInput.description)
    setDescription(savedInput.description)
    setSelectedStyle(savedInput.style)
    setCharCount(savedInput.description.length)
  }

  useEffect(() => {
    if (resetSignal === undefined) return
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
      saveInput(value, selectedStyle)
      setError(null)
    },
    [selectedStyle, saveInput],
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
      if (isPremium && onCreditsExhausted) {
        onCreditsExhausted()
      }
      return
    }

    onGenerate(trimmedDescription)
  }, [
    description,
    isSignedIn,
    canGenerateMore,
    isPremium,
    onCreditsExhausted,
    onGenerate,
    redirectToSignIn,
  ])

  const isBtnLoading = isGenerating
  // 未登录时也可以点击按钮（会跳转登录）
  const canGenerate = !isBtnLoading && !disabled && isAuthLoaded

  // 按钮文案
  const getButtonText = () => {
    if (!isAuthLoaded) return '加载中...'
    if (isBtnLoading) return '生成中...'
    return '一键生成'
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-bold">封面描述</h2>
        <textarea
          id="description"
          ref={descriptionRef}
          value={description}
          onChange={handleDescriptionChange}
          placeholder="例如：红色背景，祥云线条点缀，一只可爱的招财猫..."
          className="border-input/50 bg-background/50 focus-visible:border-primary/50 focus-visible:ring-primary/5 min-h-[120px] w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          rows={4}
          disabled={isBtnLoading || disabled}
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
                  {isSessionLoading ? '...' : credits}
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
  )
}
