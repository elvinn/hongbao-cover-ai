import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '套餐价格',
  description:
    '红包封面 AI 套餐价格，选择适合的套餐解锁无水印高清红包封面。支持微信支付、支付宝、信用卡/借记卡，购买后立即到账。',
  keywords: ['红包封面价格', '红包封面套餐', '红包封面购买', '红包封面会员'],
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
