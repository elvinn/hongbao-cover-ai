'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserCredits {
  credits: number
  creditsExpiresAt: string | null
  accessLevel: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [isLoading, setIsLoading] = useState(true)
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await fetch('/api/user/credits')
        if (response.ok) {
          const data = await response.json()
          setUserCredits(data)
        }
      } catch (err) {
        console.error('Failed to fetch user credits:', err)
        setError('获取用户信息失败')
      } finally {
        setIsLoading(false)
      }
    }

    // 延迟一下再获取，给 webhook 处理时间
    const timer = setTimeout(fetchUserCredits, 1500)
    return () => clearTimeout(timer)
  }, [sessionId])

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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
            感谢你的购买，credits 已到账
          </p>

          {error ? (
            <div className="mb-6 rounded-lg bg-amber-50/70 p-4 text-amber-900">
              <p className="text-sm">{error}</p>
              <p className="mt-1 text-xs">请刷新页面或稍后查看</p>
            </div>
          ) : userCredits ? (
            <div className="bg-muted/50 mb-6 space-y-4 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">当前生成次数</span>
                <span className="text-foreground flex items-center text-lg font-semibold">
                  <Sparkles className="text-primary mr-1.5 h-4 w-4" />
                  {userCredits.credits} 次
                </span>
              </div>

              {userCredits.creditsExpiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">有效期至</span>
                  <span className="text-foreground">
                    {formatExpiryDate(userCredits.creditsExpiresAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">会员状态</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                  {userCredits.accessLevel === 'premium' ? '已解锁' : '免费版'}
                </span>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <Button asChild className="hb-btn-primary w-full" size="lg">
              <Link href="/">开始生成红包封面</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">查看更多套餐</Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 text-xs">
            如有问题，请联系客服支持
          </p>
        </div>
      </div>
    </main>
  )
}
