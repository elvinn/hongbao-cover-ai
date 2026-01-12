import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '隐私政策',
  description:
    '红包封面 AI 隐私政策，详细说明我们如何收集、使用和保护您的个人信息。',
  keywords: ['红包封面AI隐私政策', '隐私保护', '数据安全'],
}

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-3xl px-4 py-14 sm:py-20">
        <header className="mb-10 text-center sm:mb-14">
          <h1 className="text-primary mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            隐私政策
          </h1>
          <p className="hb-section-subtitle text-base sm:text-lg">
            最后更新日期：2026 年 1 月
          </p>
        </header>

        <div className="prose prose-neutral max-w-none">
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              1. 信息收集
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              我们收集您在使用红包封面 AI 服务时提供的信息，包括但不限于：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>注册账户时提供的电子邮件地址</li>
              <li>您输入的红包封面描述文字</li>
              <li>支付交易相关信息（由第三方支付服务商 Stripe 处理）</li>
              <li>设备信息和访问日志</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              2. 信息使用
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              我们使用收集的信息用于：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>提供、维护和改进我们的服务</li>
              <li>处理您的交易和发送相关通知</li>
              <li>响应您的请求和提供客户支持</li>
              <li>发送服务更新和营销信息（您可随时取消订阅）</li>
              <li>检测、预防和解决技术问题及安全问题</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              3. 信息共享
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              我们不会出售您的个人信息。我们可能在以下情况下共享您的信息：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>经您同意或按您的指示</li>
              <li>与提供服务所需的第三方服务提供商（如支付处理商 Stripe）</li>
              <li>遵守法律义务或响应合法的法律程序</li>
              <li>保护我们的权利、隐私、安全或财产</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              4. 数据安全
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              我们采取合理的技术和组织措施来保护您的个人信息免受未经授权的访问、使用或泄露。所有数据传输均使用
              SSL/TLS 加密，支付信息由 PCI DSS 合规的 Stripe 处理。
            </p>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              5. Cookie 和追踪技术
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              我们使用 Cookie
              和类似技术来改善用户体验、分析服务使用情况。您可以通过浏览器设置控制
              Cookie 的使用，但这可能影响某些功能的正常使用。
            </p>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              6. 您的权利
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              您有权：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>访问和获取您的个人信息副本</li>
              <li>更正不准确的个人信息</li>
              <li>请求删除您的个人信息</li>
              <li>反对或限制某些处理活动</li>
              <li>撤回同意（不影响撤回前处理的合法性）</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              7. 联系我们
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              邮箱：
              <a
                href="mailto:support@elvinn.wiki"
                className="text-primary underline underline-offset-4 hover:opacity-80"
              >
                support@elvinn.wiki
              </a>
            </p>
          </section>

          <section className="hb-card p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              8. 政策更新
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，并注明最后更新日期。我们建议您定期查阅本政策以了解任何变更。继续使用我们的服务即表示您接受更新后的隐私政策。
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
