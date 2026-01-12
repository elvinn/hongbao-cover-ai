import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '微信红包封面配置教程',
  description:
    '手把手教你如何上传微信红包封面，包括红包封面开放平台申请、视频号认证、封面尺寸规范、审核流程等详细步骤。',
  keywords: [
    '微信红包封面教程',
    '红包封面怎么上传',
    '红包封面配置',
    '视频号认证',
    '红包封面开放平台',
    '红包封面申请',
    '红包封面尺寸',
    '红包封面审核',
  ],
}

export default function TutorialPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-3xl px-4 py-14 sm:py-20">
        <header className="mb-10 text-center sm:mb-14">
          <h1 className="text-primary mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            微信红包封面配置教程
          </h1>
          <p className="hb-section-subtitle text-base sm:text-lg">
            从零开始，手把手教你上传自己的红包封面
          </p>
        </header>

        <div className="prose prose-neutral max-w-none">
          {/* 什么是微信红包封面 */}
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              什么是微信红包封面
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              微信红包封面是微信红包的个性化外观，在发送和领取红包时会展示你定制的封面图片，让红包更有特色和仪式感。每逢春节、生日、节日等场合，一个精心设计的红包封面能让你的祝福更加与众不同。
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              2020年底，微信正式开放了红包封面定制功能，个人和企业都可以制作自己专属的红包封面。
            </p>
          </section>

          {/* 红包封面开放平台 */}
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              红包封面开放平台
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              微信红包封面开放平台（cover.weixin.qq.com）是官方提供的红包封面定制入口。在这里，你可以：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>上传自己设计的封面图片</li>
              <li>设置封面的发放数量</li>
              <li>管理已发布的红包封面</li>
              <li>查看封面的领取和使用数据</li>
            </ul>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              平台网址：
              <a
                href="https://cover.weixin.qq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:opacity-80"
              >
                cover.weixin.qq.com
              </a>
            </p>
          </section>

          {/* 个人申请条件 */}
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              个人申请红包封面的条件
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              个人用户需要先完成视频号认证，才能定制红包封面。视频号认证分为两种：
            </p>

            <div className="mt-4 rounded-lg bg-amber-50/70 p-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-900">
                兴趣认证（推荐）
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-amber-800">
                <li>近30天内发布至少1条原创视频（时长15秒以上）</li>
                <li>已填写账号简介，明确你的内容领域</li>
                <li>粉丝数达到1000人以上</li>
                <li>近30天视频平均播放量500次以上</li>
              </ul>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50/70 p-4">
              <h3 className="mb-2 text-sm font-semibold text-blue-900">
                职业认证
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
                <li>近30天内发布至少1条内容</li>
                <li>已填写简介</li>
                <li>提供职业证明材料（如教师资格证、医师资格证等）</li>
                <li>材料需清晰拍摄，格式为 JPG/PNG，大小不超过 5MB</li>
              </ul>
            </div>
          </section>

          {/* 企业申请条件 */}
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              企业申请红包封面的条件
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              企业用户的申请相对简单，需要完成以下步骤：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-decimal space-y-2 text-sm">
              <li>使用企业微信账号登录红包封面开放平台</li>
              <li>完成企业认证（提交营业执照等资质）</li>
              <li>认证通过后即可定制红包封面</li>
            </ul>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              企业认证一般需要 1-3
              个工作日，认证通过后可以制作更多数量的红包封面。
            </p>
          </section>

          {/* 封面尺寸规范 */}
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              红包封面尺寸规范
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              上传红包封面时，需要严格按照微信的尺寸要求准备图片：
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="text-muted-foreground w-full text-sm">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-foreground py-2 text-left font-medium">
                      素材类型
                    </th>
                    <th className="text-foreground py-2 text-left font-medium">
                      尺寸要求
                    </th>
                    <th className="text-foreground py-2 text-left font-medium">
                      格式/大小
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border border-b">
                    <td className="py-2">拆红包页封面</td>
                    <td className="py-2">957 × 1278 像素</td>
                    <td className="py-2">PNG/JPG/JPEG，≤500KB</td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="py-2">封面挂件</td>
                    <td className="py-2">1053 × 1746 像素</td>
                    <td className="py-2">PNG，≤300KB</td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="py-2">气泡挂件</td>
                    <td className="py-2">480 × 384 像素</td>
                    <td className="py-2">PNG，≤100KB</td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="py-2">封面故事</td>
                    <td className="py-2">750 × 1250 像素</td>
                    <td className="py-2">PNG/JPG，≤500KB</td>
                  </tr>
                  <tr>
                    <td className="py-2">品牌Logo</td>
                    <td className="py-2">200 × 200 像素</td>
                    <td className="py-2">PNG，≤50KB</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg bg-emerald-50/70 p-4">
              <p className="text-sm text-emerald-900">
                <strong>提示：</strong>本站生成的红包封面尺寸为 957 × 1278
                像素，完全符合微信官方规范，可直接上传使用。
              </p>
            </div>
          </section>

          {/* 上传审核流程 */}
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              上传审核流程
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              准备好封面图片后，按以下步骤提交审核：
            </p>

            <ol className="text-muted-foreground mt-4 list-inside list-decimal space-y-3 text-sm">
              <li>
                <strong className="text-foreground">登录平台</strong>
                <p className="mt-1 pl-5">
                  访问 cover.weixin.qq.com，使用微信扫码登录
                </p>
              </li>
              <li>
                <strong className="text-foreground">创建封面</strong>
                <p className="mt-1 pl-5">
                  点击「创建封面」，上传准备好的封面图片
                </p>
              </li>
              <li>
                <strong className="text-foreground">填写信息</strong>
                <p className="mt-1 pl-5">填写封面名称、设置发放数量等信息</p>
              </li>
              <li>
                <strong className="text-foreground">支付费用</strong>
                <p className="mt-1 pl-5">
                  红包封面定价 1 元/个，最低可购买 1 个
                </p>
              </li>
              <li>
                <strong className="text-foreground">等待审核</strong>
                <p className="mt-1 pl-5">
                  提交后平台会进行审核，一般 3 个工作日内完成
                </p>
              </li>
              <li>
                <strong className="text-foreground">审核通过</strong>
                <p className="mt-1 pl-5">
                  审核通过后，你就可以把封面发给朋友使用了
                </p>
              </li>
            </ol>

            <div className="mt-4 rounded-lg bg-red-50/70 p-4">
              <p className="text-sm text-red-900">
                <strong>注意：</strong>
                封面内容不能包含违法违规、低俗、侵权等内容，否则会被驳回。设计时请确保内容积极健康。
              </p>
            </div>
          </section>

          {/* 如何使用本站生成的封面 */}
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              如何使用本站生成的封面
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              使用红包封面 AI 生成封面后，按以下步骤完成配置：
            </p>

            <ol className="text-muted-foreground mt-4 list-inside list-decimal space-y-3 text-sm">
              <li>
                <strong className="text-foreground">生成封面</strong>
                <p className="mt-1 pl-5">
                  在本站首页输入描述，点击生成，等待 AI 创作完成
                </p>
              </li>
              <li>
                <strong className="text-foreground">下载图片</strong>
                <p className="mt-1 pl-5">
                  生成完成后，下载高清无水印版本（需购买套餐）
                </p>
              </li>
              <li>
                <strong className="text-foreground">上传到微信</strong>
                <p className="mt-1 pl-5">
                  登录红包封面开放平台，上传下载的图片
                </p>
              </li>
              <li>
                <strong className="text-foreground">完成配置</strong>
                <p className="mt-1 pl-5">按提示填写信息、支付费用、提交审核</p>
              </li>
            </ol>
          </section>

          {/* CTA */}
          <section className="hb-card bg-primary/5 p-6 text-center">
            <h2 className="text-foreground mb-3 text-lg font-semibold">
              开始制作你的红包封面
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              输入一句话，AI 帮你生成独一无二的红包封面
            </p>
            <Link
              href="/"
              className="hb-btn-primary inline-block rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors"
            >
              立即生成 →
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}
