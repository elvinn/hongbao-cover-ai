'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, SignInButton } from '@clerk/nextjs'
import {
  TicketIcon,
  Loader2,
  CheckCircle2,
  Gift,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/tailwind'
import type { RedemptionResult } from '@/config/redemption'

export default function RedeemPage() {
  const searchParams = useSearchParams()
  const { isLoaded, isSignedIn } = useAuth()

  const [code, setCode] = useState(searchParams.get('code') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RedemptionResult | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!code.trim()) {
        setError('请输入兑换码')
        return
      }

      setIsLoading(true)
      setError(null)
      setResult(null)

      try {
        const response = await fetch('/api/redeem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: code.trim() }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            // 未登录，不做处理，UI 会显示登录按钮
            setError('请先登录后再兑换')
            return
          }
          throw new Error(data.message || '兑换失败')
        }

        setResult(data)
        setCode('')
      } catch (err) {
        setError(err instanceof Error ? err.message : '兑换失败，请稍后重试')
      } finally {
        setIsLoading(false)
      }
    },
    [code],
  )

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-lg px-4 py-12 sm:py-20">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            <Gift className="h-4 w-4" />
            兑换码兑换
          </div>
          <h1 className="text-foreground mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            输入您的兑换码
          </h1>
          <p className="hb-section-subtitle text-base sm:text-lg">
            使用兑换码获取生成次数，开启 AI 红包封面创作之旅
          </p>
        </header>

        {/* Redemption Form */}
        <div className="hb-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-foreground text-sm font-medium"
              >
                兑换码
              </label>
              <div className="relative">
                <TicketIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    if (error) setError(null)
                  }}
                  placeholder="请输入兑换码"
                  className="h-12 pl-10 text-center text-lg tracking-widest uppercase"
                  disabled={isLoading}
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-center text-red-700 backdrop-blur-sm">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {result && result.success && (
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">{result.message}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div className="rounded-lg bg-white/60 p-3">
                    <p className="text-muted-foreground mb-1">当前积分</p>
                    <p className="text-foreground text-lg font-bold">
                      {result.newCredits} 次
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3">
                    <p className="text-muted-foreground mb-1">有效期</p>
                    <p className="text-foreground text-lg font-bold">
                      永久有效
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {isLoaded && isSignedIn ? (
              <Button
                type="submit"
                disabled={isLoading || !code.trim()}
                className={cn(
                  'hb-btn-primary h-12 w-full text-base font-bold transition-all active:scale-[0.98]',
                )}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    兑换中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    立即兑换
                  </>
                )}
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  type="button"
                  className={cn(
                    'hb-btn-primary h-12 w-full text-base font-bold transition-all active:scale-[0.98]',
                  )}
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  登录后兑换
                </Button>
              </SignInButton>
            )}
          </form>
        </div>

        {/* Features */}
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="bg-primary/10 mx-auto flex h-10 w-10 items-center justify-center rounded-full">
              <Gift className="text-primary h-5 w-5" />
            </div>
            <p className="text-foreground text-sm font-medium">免费获取</p>
            <p className="text-muted-foreground text-xs">活动兑换码</p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 mx-auto flex h-10 w-10 items-center justify-center rounded-full">
              <Zap className="text-primary h-5 w-5" />
            </div>
            <p className="text-foreground text-sm font-medium">即时到账</p>
            <p className="text-muted-foreground text-xs">积分立即生效</p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 mx-auto flex h-10 w-10 items-center justify-center rounded-full">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <p className="text-foreground text-sm font-medium">无水印</p>
            <p className="text-muted-foreground text-xs">高清下载</p>
          </div>
        </div>

        {/* CTA */}
        {result && result.success && (
          <div className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
            >
              <Link href="/">
                <Sparkles className="mr-2 h-5 w-5" />
                立即生成封面
              </Link>
            </Button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-xs">
            还没有兑换码？
            <Link href="/pricing" className="text-primary hover:underline">
              查看付费套餐
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
