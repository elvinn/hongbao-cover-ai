import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '服务协议',
  description:
    '红包封面 AI 服务协议，包含服务说明、用户账户、费用、使用规范、知识产权等条款。',
  keywords: ['红包封面AI服务协议', '使用条款', '用户协议'],
}

export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container max-w-3xl px-4 py-14 sm:py-20">
        <header className="mb-10 text-center sm:mb-14">
          <h1 className="text-primary mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            服务协议
          </h1>
          <p className="hb-section-subtitle text-base sm:text-lg">
            最后更新日期：2026 年 1 月
          </p>
        </header>

        <div className="prose prose-neutral max-w-none">
          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              1. 服务说明
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              红包封面
              AI（以下简称「本服务」）是一项基于人工智能技术的红包封面生成服务。用户可以通过输入文字描述，使用
              AI 技术生成符合微信红包封面规范的图片。本服务由红包封面 AI
              团队运营和维护。
            </p>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              2. 用户账户
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              使用本服务的部分功能需要注册账户。您同意：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>提供真实、准确、完整的注册信息</li>
              <li>妥善保管账户密码，对账户下的所有活动负责</li>
              <li>发现账户被未授权使用时立即通知我们</li>
              <li>不得将账户转让或出借给他人使用</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              3. 服务内容与费用
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              本服务提供免费和付费两种模式：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>免费用户可体验 1 次 AI 生成，生成的图片带有水印</li>
              <li>付费用户可获得更多生成次数和高清无水印图片</li>
              <li>购买的 Credits 有效期为 30 天，过期失效</li>
              <li>所有付费项目一经购买，除法律规定外不予退款</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              4. 使用规范
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              您在使用本服务时不得：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>生成违反法律法规或公序良俗的内容</li>
              <li>生成侵犯他人知识产权、肖像权等合法权益的内容</li>
              <li>生成涉及色情、暴力、歧视、仇恨等不当内容</li>
              <li>使用任何自动化工具批量访问或抓取本服务</li>
              <li>尝试破解、反编译或干扰本服务的正常运行</li>
              <li>将本服务用于任何非法目的</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              5. 知识产权
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              关于本服务涉及的知识产权：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>本服务的软件、技术、界面设计等知识产权归我们所有</li>
              <li>AI 生成的图片可供用户个人使用</li>
              <li>
                用户需自行确保生成内容不侵犯第三方权益，并对使用后果自行负责
              </li>
              <li>商业使用请确保了解相关法律法规并自行承担风险</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              6. 免责声明
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              本服务按「现状」提供，我们不对以下情况承担责任：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>AI 生成内容的准确性、完整性或适用性</li>
              <li>因不可抗力、系统维护等导致的服务中断</li>
              <li>用户因违反本协议或法律法规导致的任何损失</li>
              <li>
                生成的红包封面能否通过微信官方审核（请参考微信红包封面开放平台的相关规定）
              </li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              7. 服务变更与终止
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              我们保留以下权利：
            </p>
            <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm">
              <li>随时修改、暂停或终止本服务（部分或全部）</li>
              <li>对违反本协议的用户采取警告、限制或封禁账户等措施</li>
              <li>不定期更新本协议，更新后继续使用即视为接受新协议</li>
            </ul>
          </section>

          <section className="hb-card mb-6 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              8. 争议解决
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              本协议的解释和执行均适用中华人民共和国法律。因本协议引起的争议，双方应友好协商解决；协商不成的，任何一方可向有管辖权的人民法院提起诉讼。
            </p>
          </section>

          <section className="hb-card p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              9. 联系我们
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              如果您对本服务协议有任何疑问，请通过以下方式联系我们：
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
        </div>
      </div>
    </main>
  )
}
