'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRICING_PLANS, type PricingPlan } from '@/config/pricing'
import type { PlanId } from '@/types/database'
import { cn } from '@/utils/tailwind'

const PRICING_FAQS = [
  {
    question: '购买后生成次数什么时候到账？',
    answer:
      '支付成功后，生成次数将立即自动充值到您的账户中。您可以在个人中心查看余额。',
  },
  {
    question: '生成次数会过期吗？',
    answer: '不会！购买的生成次数永久有效，次数永不过期，您可以随时使用。',
  },
  {
    question: '支持退款吗？',
    answer:
      '由于 AI 生成属于消耗性数字产品，一旦开始消耗生成次数，原则上不支持退款。如有异常支付问题请联系客服。',
  },
  {
    question: '生成的封面可以商用吗？',
    answer:
      '生成的封面可供个人社交账号使用。如需大规模商用，请确保遵循相关素材版权规定。',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled') === 'true'

  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (planId: PlanId) => {
    setLoadingPlan(planId)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // 未登录，跳转到登录页
          router.push('/sign-in?redirect=/pricing')
          return
        }
        throw new Error(data.message || '创建支付会话失败')
      }

      if (data.url) {
        // 跳转到 Stripe Checkout 页面
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请稍后重试')
    } finally {
      setLoadingPlan(null)
    }
  }

  const plans = Object.values(PRICING_PLANS)

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-4xl px-4 py-12 sm:py-20">
        <header className="mb-12 text-center sm:mb-16">
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            <Zap className="h-4 w-4" />
            立即升级，解锁无限可能
          </div>
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            选择适合您的方案
          </h1>
          <p className="hb-section-subtitle text-lg sm:text-xl">
            专业 AI 生成，高清无水印，让您的红包封面脱颖而出
          </p>
        </header>

        {canceled && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center text-amber-900 backdrop-blur-sm">
            <p className="text-sm">
              支付已取消，您可以随时重新选择适合您的套餐
            </p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50/50 p-4 text-center text-red-700 backdrop-blur-sm">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isLoading={loadingPlan === plan.id}
              disabled={loadingPlan !== null}
              onPurchase={() => handlePurchase(plan.id)}
            />
          ))}
        </div>

        {/* Payment Methods Section */}
        <div className="mt-12 sm:mt-16">
          <div className="hb-card mx-auto max-w-2xl p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-center gap-2">
              <ShieldCheck className="text-primary h-5 w-5" />
              <span className="text-foreground text-sm font-semibold">
                支持多种便捷支付方式
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {/* WeChat Pay */}
              <div className="flex items-center gap-2 rounded-lg bg-[#07C160]/10 px-4 py-2 transition-colors hover:bg-[#07C160]/20">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="#07C160"
                  aria-hidden="true"
                >
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                </svg>
                <span className="text-sm font-medium text-[#07C160]">
                  微信支付
                </span>
              </div>
              {/* Alipay */}
              <div className="flex items-center gap-2 rounded-lg bg-[#1677FF]/10 px-4 py-2 transition-colors hover:bg-[#1677FF]/20">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="#1677FF"
                  aria-hidden="true"
                >
                  <path d="M21.422 15.358c-.6-.227-3.065-1.15-5.328-1.987.46-.905.835-1.884 1.11-2.918h-3.503v-1.26h4.181V8.168h-4.181V5.966h-2.236c-.18 0-.3.12-.3.3v1.902H7.171v1.025h3.994v1.26H7.533v1.025h7.108c-.21.652-.476 1.27-.795 1.847-2.57-.93-5.347-1.745-7.327-1.442-2.08.318-3.584 1.464-4.088 3.124-.755 2.482.57 5.134 3.752 5.134 2.335 0 4.559-1.418 6.534-4.126.753.346 1.53.715 2.32 1.102 2.292 1.121 4.389 2.148 5.36 2.569a10.088 10.088 0 0 0 1.715-3.323zM6.753 17.963c-2.2 0-3.06-1.678-2.634-3.017.326-1.02 1.276-1.827 2.593-1.97 1.713-.184 3.8.508 6.096 1.498-1.548 2.2-3.547 3.49-6.055 3.49z" />
                </svg>
                <span className="text-sm font-medium text-[#1677FF]">
                  支付宝
                </span>
              </div>
              {/* Credit Card */}
              <div className="text-muted-foreground flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 transition-colors hover:bg-slate-200">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
                <span className="text-sm font-medium">信用卡/借记卡</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-center text-xs">
              支付由{' '}
              <span className="font-semibold text-[#635BFF]">Stripe</span>{' '}
              安全处理，全球领先的支付平台
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 sm:mt-32">
          <div className="mb-10 text-center">
            <div className="text-primary mb-2 flex items-center justify-center gap-2 text-sm font-semibold tracking-wider uppercase">
              <HelpCircle className="h-4 w-4" />
              常见问题
            </div>
            <h2 className="text-2xl font-bold">还有其他疑问？</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {PRICING_FAQS.map((faq, index) => (
              <div
                key={index}
                className="hb-card group p-6 transition-all hover:bg-white/80"
              >
                <h3 className="text-foreground mb-2 text-base font-semibold">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            如有任何疑问，请联系我们：support@elvinn.wiki
          </p>
        </div>
      </div>
    </main>
  )
}

interface PricingCardProps {
  plan: PricingPlan
  isLoading: boolean
  disabled: boolean
  onPurchase: () => void
}

function PricingCard({
  plan,
  isLoading,
  disabled,
  onPurchase,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'hb-card relative flex flex-col p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        plan.recommended
          ? 'ring-primary border-primary/50 shadow-lg ring-2'
          : 'hover:border-primary/30',
      )}
    >
      {plan.recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground shadow-primary/20 flex items-center gap-1 rounded-full px-4 py-1 text-xs font-bold tracking-wide uppercase shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
            最受欢迎
          </span>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-foreground text-2xl font-bold">{plan.name}</h3>
          {plan.id === 'premium' && (
            <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-bold">
              超值优惠
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {plan.description}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-foreground text-5xl font-extrabold tracking-tight">
            {plan.priceDisplay}
          </span>
          <span className="text-muted-foreground text-sm font-medium">
            / 一次支付·无需订阅
          </span>
        </div>
      </div>

      <div className="mb-8 flex-1">
        <p className="text-foreground mb-4 text-sm font-semibold">包含功能：</p>
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="group flex items-center text-sm">
              <div className="bg-primary/10 group-hover:bg-primary/20 mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors">
                <Check className="text-primary h-3.5 w-3.5" />
              </div>
              <span className="text-foreground/90 font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onPurchase}
        disabled={disabled}
        className={cn(
          'w-full py-6 text-base font-bold transition-all active:scale-[0.98]',
          plan.recommended ? 'hb-btn-primary' : '',
        )}
        variant={plan.recommended ? 'default' : 'outline'}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            支付跳转中...
          </>
        ) : (
          `立即获取 ${plan.priceDisplay}`
        )}
      </Button>

      <p className="text-muted-foreground mt-4 text-center text-[10px]">
        点击按钮即代表您同意我们的{' '}
        <a href="/terms" className="hover:text-primary underline">
          服务条款
        </a>
      </p>
    </div>
  )
}
