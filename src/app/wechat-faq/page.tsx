import type { Metadata } from 'next'
import Link from 'next/link'
import { Layout, Link as LinkIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: '微信规范指南',
  description: '微信红包封面官方平台的申请要求与常见问题解答。',
  keywords: [
    '微信红包封面价格',
    '红包封面个人能做吗',
    '红包封面申请条件',
    '红包封面多少钱',
    '红包封面审核时间',
    '视频号认证条件',
    '红包封面尺寸',
    '红包封面怎么做',
  ],
}

const faqs = [
  {
    question: '个人可以做红包封面吗？',
    answer:
      '可以的。从2020年底开始，微信红包封面开放平台就支持个人创作者定制红包封面了。不过个人用户需要先开通视频号，并完成视频号认证（兴趣认证或职业认证）后才能申请。',
  },
  {
    question: '红包封面多少钱一个？',
    answer:
      '微信官方定价是 1 元/个，无论是个人还是企业，价格都一样。这个价格是支付给微信平台的制作费用，不包含设计费用。最低可以购买 1 个封面。',
  },
  {
    question: '最少要做多少个红包封面？',
    answer:
      '最低 1 个起购。你可以根据需要决定购买数量，比如只想发给几个好朋友，买 10 个就够了；如果想大范围发放，可以买更多。',
  },
  {
    question: '红包封面审核需要多久？',
    answer:
      '提交后一般 3 个工作日内会完成审核。建议在节假日前提前准备，避开审核高峰期。如果赶上春节等旺季，审核时间可能会稍长一些。',
  },
  {
    question: '红包封面的尺寸要求是什么？',
    answer:
      '主封面图片尺寸为 957×1278 像素，格式支持 PNG、JPG、JPEG，文件大小不超过 500KB。本站生成的封面尺寸完全符合此规范，可直接上传使用。',
  },
  {
    question: '个人和企业申请有什么区别？',
    answer:
      '主要区别在于申请条件和数量限制。个人需要完成视频号认证，企业需要完成企业认证。企业认证后通常可以制作更多数量的封面，适合需要大量发放的场景。两者的单价都是 1 元/个。',
  },
  {
    question: '视频号认证需要什么条件？',
    answer:
      '兴趣认证需要：近30天发布过原创视频、粉丝数1000以上、视频平均播放量500以上。职业认证需要：发布过内容、提供职业证明材料（如资格证书）。达到其中一种认证条件即可。',
  },
  {
    question: '封面图片有什么内容限制？',
    answer:
      '不能包含违法违规、色情低俗、暴力血腥、政治敏感、侵权等内容。另外，不建议直接使用他人的照片 or 明星肖像，以免侵权被驳回。建议使用原创设计或 AI 生成的图片。',
  },
  {
    question: '红包封面可以用多久？',
    answer:
      '红包封面没有使用期限，买了就是你的。但要注意，封面的「发放」是有限制的，一旦发完就没了。用户领取封面后，在1年内可以使用该封面发红包。',
  },
  {
    question: '审核不通过怎么办？',
    answer:
      '审核不通过时，平台会告知具体原因。常见原因包括：图片模糊、包含违规内容、涉嫌侵权等。根据反馈修改后可以重新提交，修改后的审核时间同样是 3 个工作日内。',
  },
]

export default function WechatFAQPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-4xl px-4 py-12 sm:py-20">
        <header className="mb-12 text-center sm:mb-16">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            微信规范指南
          </h1>
          <p className="hb-section-subtitle text-lg sm:text-xl">
            关于微信红包封面官方平台的申请要求与常见问题
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

        {/* 相关资源 */}
        <div className="bg-accent/30 mt-20 rounded-2xl border p-8 sm:p-12">
          <h2 className="mb-8 text-center text-2xl font-bold">相关资源</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/tutorial"
              className="hb-card flex items-center gap-4 bg-white/50 p-6 transition-all hover:bg-white hover:shadow-sm"
            >
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <Layout className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">配置教程</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  详细的上传步骤指南
                </p>
              </div>
            </Link>
            <a
              href="https://cover.weixin.qq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hb-card flex items-center gap-4 bg-white/50 p-6 transition-all hover:bg-white hover:shadow-sm"
            >
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <LinkIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">开放平台</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  微信官方申请入口
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground mb-6 text-sm">
            准备好制作您的专属红包封面了吗？
          </p>
          <Link
            href="/"
            className="hb-btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-3 text-base font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            立即开启 AI 创作 →
          </Link>
        </div>
      </div>
    </main>
  )
}
