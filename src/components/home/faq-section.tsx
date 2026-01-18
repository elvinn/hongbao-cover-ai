import Link from 'next/link'
import { HelpCircle } from 'lucide-react'

export function FAQSection() {
  const faqs = [
    {
      q: '生成的封面可以直接在微信使用吗？',
      a: '是的。生成的红包封面图片符合微信红包封面官方尺寸规范。下载原图后，在微信红包封面开放平台提交审核即可使用。',
    },
    {
      q: '审核一般需要多久？',
      a: '微信红包封面官方审核通常需要 1-3 个工作日。建议在春节或节日前提前制作你的红包封面。',
    },
    {
      q: '水印如何去除？',
      a: '购买任意套餐后，AI 生成的红包封面会自动去除水印，并提供高清原图下载。',
    },
  ]

  return (
    <section className="border-border/40 w-full border-t bg-white/40 py-20 sm:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">常见疑问</h2>
          <p className="text-muted-foreground">快速了解红包封面 AI</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border-border/40 rounded-2xl border bg-white p-6 shadow-sm"
            >
              <h3 className="mb-3 flex items-center gap-2 font-bold">
                <HelpCircle className="text-primary h-4 w-4" />
                {faq.q}
              </h3>
              <p className="text-muted-foreground pl-6 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="text-muted-foreground hover:text-primary text-sm font-medium underline underline-offset-4"
          >
            查看完整帮助中心 →
          </Link>
        </div>
      </div>
    </section>
  )
}
