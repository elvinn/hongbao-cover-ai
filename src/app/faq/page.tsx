import type { Metadata } from 'next'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: '常见问题',
  description:
    '红包封面 AI 常见问题解答，包括生成时间、使用方法、套餐价格、支付方式、版权归属等问题的详细解答。',
  keywords: [
    '红包封面常见问题',
    '红包封面使用帮助',
    '红包封面FAQ',
    '红包封面生成问题',
  ],
}

const faqs = [
  {
    question: '红包封面生成需要多长时间？',
    answer:
      'AI 生成通常需要 10-30 秒，具体时间取决于服务器负载情况。生成完成后会自动显示预览。',
  },
  {
    question: '生成的红包封面可以直接用于微信吗？',
    answer:
      '生成的封面符合微信红包封面的尺寸要求。但上传到微信红包封面开放平台需要满足其他审核要求，请参考微信官方指南。',
  },
  {
    question: '免费用户有多少次生成机会？',
    answer:
      '免费用户可以体验 1 次 AI 生成。生成的封面会带有水印，购买套餐后可解锁高清无水印版本。',
  },
  {
    question: '生成的封面默认是公开还是私密？',
    answer:
      '新生成的封面默认公开可见。如需设为私密，仅自己可见：进入“我的封面”→ 选择封面 → 设为私密。',
  },
  {
    question: '购买套餐后生成次数会过期吗？',
    answer:
      '不会！购买的生成次数永久有效，次数永不过期，您可以随时使用，不用担心过期问题。',
  },
  {
    question: '支持哪些支付方式？',
    answer:
      '目前支持微信支付、支付宝，以及信用卡/借记卡（Visa、MasterCard、银联等）。',
  },
  {
    question: '生成的封面版权归谁所有？',
    answer:
      'AI 生成的封面可供个人使用。如需商业用途，请确保了解相关法律法规并自行承担风险。',
  },
  {
    question: '可以退款吗？',
    answer:
      '由于数字商品的特殊性，购买后一般不支持退款。如遇特殊情况，请联系客服咨询。',
  },
]

export default function FAQPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-4xl px-4 py-12 sm:py-20">
        <header className="mb-12 text-center sm:mb-16">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            常见问题
          </h1>
          <p className="hb-section-subtitle text-lg sm:text-xl">
            关于红包封面 AI 的使用疑问，您都可以在这里找到答案
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="hb-card group p-8 transition-all hover:bg-white/80 hover:shadow-md"
            >
              <h3 className="text-foreground mb-3 text-lg font-bold">
                {faq.question}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-accent/30 mt-20 rounded-2xl border p-8 text-center sm:p-12">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">还有其他问题？</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            没有找到您需要的答案？欢迎随时通过邮件联系我们的技术支持。
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="mailto:support@elvinn.wiki"
              className="hb-btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              联系客服 support@elvinn.wiki
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
