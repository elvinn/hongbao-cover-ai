import type { Metadata } from 'next'

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
      '生成的封面符合微信红包封面的尺寸要求（957×1278 像素）。但上传到微信红包封面开放平台需要满足其他审核要求，请参考微信官方指南。',
  },
  {
    question: '免费用户有多少次生成机会？',
    answer:
      '免费用户可以体验 1 次 AI 生成。生成的封面会带有水印，购买套餐后可解锁高清无水印版本。',
  },
  {
    question: '购买套餐后 credits 会过期吗？',
    answer:
      '是的，购买的 credits 有效期为 30 天，请在有效期内使用。过期后未使用的 credits 将失效。',
  },
  {
    question: '支持哪些支付方式？',
    answer:
      '目前支持通过 Stripe 支付，可使用信用卡或借记卡（Visa、MasterCard、银联等）。',
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
  {
    question: '如何联系客服？',
    answer: '如有问题或建议，欢迎通过邮件联系我们：support@elvinn.wiki',
  },
]

export default function FAQPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-3xl px-4 py-14 sm:py-20">
        <header className="mb-10 text-center sm:mb-14">
          <h1 className="text-primary mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            常见问题
          </h1>
          <p className="hb-section-subtitle text-base sm:text-lg">
            关于红包封面生成器的常见问题解答
          </p>
        </header>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="hb-card p-6">
              <h3 className="text-foreground mb-2 text-base font-semibold">
                {faq.question}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            没有找到答案？欢迎联系我们 support@elvinn.wiki
          </p>
        </div>
      </div>
    </main>
  )
}
