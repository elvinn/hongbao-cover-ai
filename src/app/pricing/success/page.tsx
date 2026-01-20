'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VerifySessionResponse {
  success: boolean
  credits?: number
  accessLevel?: string
  error?: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [isLoading, setIsLoading] = useState(true)
  const [verifyResult, setVerifyResult] =
    useState<VerifySessionResponse | null>(null)

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setVerifyResult({ success: false, error: '缺少支付会话信息' })
        setIsLoading(false)
        return
      }

      try {
        // 延迟一下再获取，给 webhook 处理时间
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const response = await fetch(
          `/api/stripe/verify-session?session_id=${sessionId}`,
        )
        const data: VerifySessionResponse = await response.json()
        setVerifyResult(data)
      } catch (err) {
        console.error('Failed to verify session:', err)
        setVerifyResult({ success: false, error: '验证支付状态失败' })
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [sessionId])

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="text-muted-foreground mt-4">正在确认支付结果...</p>
        </div>
      </main>
    )
  }

  // 支付失败或处理异常
  if (!verifyResult?.success) {
    return (
      <main className="flex min-h-screen flex-col items-center">
        <div className="container max-w-lg px-4 py-20">
          <div className="hb-card p-8 text-center">
            <div className="mb-6">
              <XCircle className="mx-auto h-16 w-16 text-red-500" />
            </div>

            <h1 className="text-foreground mb-2 text-2xl font-semibold">
              支付处理异常
            </h1>
            <p className="text-muted-foreground mb-6">
              {verifyResult?.error || '支付验证失败，请联系客服处理'}
            </p>

            <div className="bg-muted/50 mb-6 rounded-lg p-4">
              <p className="text-muted-foreground text-sm">
                如果你已完成支付，请联系客服处理：
              </p>
              <a
                href="mailto:support@elvinn.wiki"
                className="text-primary mt-1 block font-medium hover:underline"
              >
                support@elvinn.wiki
              </a>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="hb-btn-primary w-full"
                size="lg"
              >
                刷新页面重试
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/pricing">返回套餐页面</Link>
              </Button>
            </div>

            <p className="text-muted-foreground mt-6 text-xs">
              如有问题，请联系客服：
              <a
                href="mailto:support@elvinn.wiki"
                className="text-primary hover:underline"
              >
                support@elvinn.wiki
              </a>
            </p>
          </div>
        </div>
      </main>
    )
  }

  // 支付成功
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-lg px-4 py-20">
        <div className="hb-card p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>

          <h1 className="text-foreground mb-2 text-2xl font-semibold">
            支付成功！
          </h1>
          <p className="text-muted-foreground mb-6">
            感谢你的购买，生成次数已到账
          </p>

          <div className="bg-muted/50 mb-6 space-y-4 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">当前生成次数</span>
              <span className="text-foreground flex items-center text-lg font-semibold">
                <Sparkles className="text-primary mr-1.5 h-4 w-4" />
                {verifyResult.credits} 次
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">有效期</span>
              <span className="text-foreground font-medium">永久有效</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">会员状态</span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                {verifyResult.accessLevel === 'premium' ? '已解锁' : '免费版'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="hb-btn-primary w-full" size="lg">
              <Link href="/">开始生成红包封面</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">查看更多套餐</Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 text-xs">
            如有问题，请联系客服：
            <a
              href="mailto:support@elvinn.wiki"
              className="text-primary hover:underline"
            >
              support@elvinn.wiki
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
