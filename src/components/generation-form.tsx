'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  generationCount: number
  credits: number
  canGenerateMore: boolean
  isGenerating?: boolean
  isSessionLoading?: boolean
  initialPrompt?: string
  initialStyle?: CoverStyle
  descriptionRef?: React.RefObject<HTMLTextAreaElement | null>
}

export function GenerationForm({
  onGenerate,
  disabled = false,
  generationCount,
  credits,
  canGenerateMore,
  isGenerating = false,
  isSessionLoading = false,
  initialPrompt = '',
  initialStyle = 'newyear',
  descriptionRef,
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

  // 清除已使用的缓存（只在挂载时执行）
  const hasClearedCacheRef = useRef(false)
  useEffect(() => {
    if (!hasClearedCacheRef.current && getCachedPrompt()) {
      clearCachedPrompt()
      hasClearedCacheRef.current = true
    }
  }, [])

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setDescription(value)
      setCharCount(value.length)
      setHasTouched(true)
      if (isSignedIn) {
        saveInput(value, selectedStyle)
      }
      setError(null)
    },
    [selectedStyle, saveInput, isSignedIn],
  )

  const handleStyleChange = useCallback(
    (style: CoverStyle) => {
      setSelectedStyle(style)
      if (isSignedIn) {
        saveInput(description, style)
      }
    },
    [description, saveInput, isSignedIn],
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
      return
    }

    onGenerate(trimmedDescription)
  }, [description, isSignedIn, canGenerateMore, onGenerate, redirectToSignIn])

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
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="hb-section-title text-lg">封面描述</h2>
        <textarea
          id="description"
          ref={descriptionRef}
          value={description}
          onChange={handleDescriptionChange}
          placeholder="红色背景，祥云线条点缀，温暖喜庆的氛围..."
          className="border-input/70 bg-background/55 text-foreground placeholder:text-muted-foreground/80 focus-visible:ring-ring/40 w-full rounded-xl border px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          rows={4}
          disabled={isBtnLoading || disabled}
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>
            {hasTouched && charCount < 4 ? (
              <span className="text-destructive">至少需要4个字符</span>
            ) : (
              '描述清晰有助于生成更好的封面'
            )}
          </span>
          <span className={charCount > 2000 ? 'text-destructive' : ''}>
            {charCount}/2000
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {isSignedIn && (
            <>
              剩余生成次数:{' '}
              <span className="text-foreground font-medium">
                {isSessionLoading ? '-' : credits}
              </span>
            </>
          )}
        </div>
        <Button onClick={handleGenerate} disabled={!canGenerate} size="lg">
          {isBtnLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            getButtonText()
          )}
        </Button>
      </div>
    </div>
  )
}
