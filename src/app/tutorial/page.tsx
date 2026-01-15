import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
      <div className="container max-w-4xl px-4 py-12 sm:py-20">
        <header className="mb-12 text-center sm:mb-20">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            配置教程
          </h1>
          <p className="hb-section-subtitle text-lg sm:text-xl">
            从零开始，手把手教您上传并发布专属红包封面
          </p>
        </header>

        <div className="space-y-12 sm:space-y-16">
          {/* 什么是微信红包封面 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">1. 什么是微信红包封面</h2>
            </div>
            <div className="hb-card p-8">
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                微信红包封面是微信红包的个性化外观，在发送和领取红包时会展示您定制的封面图片，让红包更有特色和仪式感。每逢春节、生日、节日等场合，一个精心设计的红包封面能让您的祝福更加与众不同。
              </p>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-base">
                2020
                年底，微信正式开放了红包封面定制功能，个人和企业都可以制作自己专属的红包封面。
              </p>
            </div>
          </section>

          {/* 红包封面开放平台 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">2. 红包封面开放平台</h2>
            </div>
            <div className="hb-card p-8">
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                微信红包封面开放平台（cover.weixin.qq.com）是官方提供的红包封面定制入口。在这里，您可以：
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  '上传自己设计的封面图片',
                  '设置封面的发放数量',
                  '管理已发布的红包封面',
                  '查看封面的领取和使用数据',
                ].map((item, i) => (
                  <div
                    key={i}
                    className="text-muted-foreground flex items-center gap-2 text-sm"
                  >
                    <div className="bg-primary/20 h-1.5 w-1.5 rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="bg-accent/30 mt-8 rounded-xl border p-4">
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  官方平台：
                  <a
                    href="https://cover.weixin.qq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold underline underline-offset-4 hover:opacity-80"
                  >
                    cover.weixin.qq.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* 个人申请条件 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">3. 个人申请条件</h2>
            </div>
            <div className="hb-card p-8">
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                个人用户需要先完成视频号认证，才能定制红包封面。视频号认证分为两种：
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-amber-900">
                    兴趣认证（推荐）
                  </h3>
                  <ul className="space-y-3 text-xs text-amber-800 sm:text-sm">
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                      <span>
                        近 30 天内发布至少 1 条原创视频（时长 15 秒以上）
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                      <span>已填写账号简介，明确您的内容领域</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                      <span>粉丝数达到 1000 人以上</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                      <span>近 30 天视频平均播放量 500 次以上</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-900">
                    职业认证
                  </h3>
                  <ul className="space-y-3 text-xs text-blue-800 sm:text-sm">
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                      <span>近 30 天内发布至少 1 条内容</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                      <span>已填写简介</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                      <span>
                        提供职业证明材料（如教师资格证、医师资格证等）
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 企业申请条件 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">4. 企业申请条件</h2>
            </div>
            <div className="hb-card p-8">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    企业用户的申请相对简单，需要完成以下步骤：
                  </p>
                  <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
                    {[
                      '使用企业微信账号登录红包封面开放平台',
                      '完成企业认证（提交营业执照等资质）',
                      '认证通过后即可定制红包封面',
                    ].map((step, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="text-primary font-bold">0{i + 1}.</div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-accent/20 rounded-xl border p-6 sm:w-64">
                  <p className="text-muted-foreground text-xs font-medium">
                    企业认证一般需要 1-3
                    个工作日，认证通过后可以制作更多数量的红包封面。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 封面尺寸规范 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">5. 封面尺寸规范</h2>
            </div>
            <div className="hb-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-accent/30 border-b">
                      <th className="text-foreground px-8 py-4 text-left font-bold">
                        素材类型
                      </th>
                      <th className="text-foreground px-8 py-4 text-left font-bold">
                        尺寸要求
                      </th>
                      <th className="text-foreground px-8 py-4 text-left font-bold">
                        格式/大小
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      [
                        '拆红包页封面',
                        '957 × 1278 像素',
                        'PNG/JPG/JPEG, ≤500KB',
                      ],
                      ['封面挂件', '1053 × 1746 像素', 'PNG, ≤300KB'],
                      ['气泡挂件', '480 × 384 像素', 'PNG, ≤100KB'],
                      ['封面故事', '750 × 1250 像素', 'PNG/JPG, ≤500KB'],
                      ['品牌 Logo', '200 × 200 像素', 'PNG, ≤50KB'],
                    ].map(([type, size, format], i) => (
                      <tr
                        key={i}
                        className="hover:bg-accent/10 transition-colors"
                      >
                        <td className="text-foreground px-8 py-4 font-medium">
                          {type}
                        </td>
                        <td className="text-muted-foreground px-8 py-4 font-mono">
                          {size}
                        </td>
                        <td className="text-muted-foreground px-8 py-4 text-xs">
                          {format}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-emerald-100 bg-emerald-50/50 p-6">
                <div className="flex items-center gap-2 text-emerald-900">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <p className="text-sm font-bold">
                    本站生成的红包封面尺寸完全符合微信官方规范，可直接上传使用。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 上传审核流程 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">6. 上传审核流程</h2>
            </div>
            <div className="hb-card p-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: '登录平台', desc: '访问官方平台，微信扫码登录' },
                  { title: '创建封面', desc: '点击「创建封面」，上传图片素材' },
                  { title: '填写信息', desc: '填写封面名称、设置发放数量' },
                  { title: '支付费用', desc: '官方定价 1 元/个，1 个起购' },
                  { title: '等待审核', desc: '一般 3 个工作日内完成审核' },
                  { title: '审核通过', desc: '审核通过后即可发放使用' },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="bg-accent/10 hover:bg-accent/20 relative flex flex-col gap-2 rounded-xl p-4 transition-all"
                  >
                    <span className="text-primary/20 absolute top-2 right-4 text-4xl font-black italic select-none">
                      {i + 1}
                    </span>
                    <h3 className="text-foreground font-bold">{step.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl border border-red-100 bg-red-50/30 p-4">
                <p className="text-xs leading-relaxed text-red-900">
                  <strong>注意：</strong>
                  封面内容不能包含违法违规、低俗、侵权等内容，否则会被驳回。设计时请确保内容积极健康。
                </p>
              </div>
            </div>
          </section>

          {/* 开始制作 */}
          <section className="bg-primary/5 rounded-3xl border p-8 text-center sm:p-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              开始制作您的红包封面
            </h2>
            <p className="text-muted-foreground mt-4 mb-8 text-lg">
              输入一句话，AI 帮您生成独一无二的高清红包封面
            </p>
            <Link
              href="/"
              className="hb-btn-primary inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-lg font-bold text-white transition-transform hover:scale-105 active:scale-95"
            >
              立即生成 <ArrowRight className="h-5 w-5" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}
