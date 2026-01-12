import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '微信红包封面常见问题',
  description:
    '微信红包封面常见问题解答，包括个人能否申请、价格多少、审核时间、尺寸要求、视频号认证条件等问题。',
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
      '不能包含违法违规、色情低俗、暴力血腥、政治敏感、侵权等内容。另外，不建议直接使用他人的照片或明星肖像，以免侵权被驳回。建议使用原创设计或 AI 生成的图片。',
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
  {
    question: '可以给别人设计红包封面吗？',
    answer:
      '可以的。你可以帮别人设计封面图片，但上传到微信平台需要使用对方的账号。每个账号定制的封面只能从该账号发放，不能转让给其他账号。',
  },
  {
    question: '除了静态图片，可以做动态封面吗？',
    answer:
      '微信支持上传视频作为封面故事，但主封面目前只支持静态图片。视频格式的封面故事可以让红包更生动，但需要额外准备视频素材。',
  },
]

export default function WechatFAQPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-3xl px-4 py-14 sm:py-20">
        <header className="mb-10 text-center sm:mb-14">
          <h1 className="text-primary mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            微信红包封面常见问题
          </h1>
          <p className="hb-section-subtitle text-base sm:text-lg">
            关于微信红包封面申请的常见问题解答
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

        {/* 相关链接 */}
        <div className="mt-10 rounded-xl border border-amber-200/70 bg-amber-50/70 p-6">
          <h2 className="mb-4 font-semibold text-amber-900">相关资源</h2>
          <ul className="space-y-2 text-sm text-amber-800">
            <li>
              <span className="mr-2">📖</span>
              <Link
                href="/tutorial"
                className="underline underline-offset-4 hover:opacity-80"
              >
                微信红包封面配置教程
              </Link>
              <span className="text-amber-700"> - 详细的上传步骤指南</span>
            </li>
            <li>
              <span className="mr-2">🔗</span>
              <a
                href="https://cover.weixin.qq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:opacity-80"
              >
                微信红包封面开放平台
              </a>
              <span className="text-amber-700"> - 官方申请入口</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4 text-sm">
            准备好制作你的红包封面了吗？
          </p>
          <Link
            href="/"
            className="hb-btn-primary inline-block rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors"
          >
            立即生成红包封面 →
          </Link>
        </div>
      </div>
    </main>
  )
}
