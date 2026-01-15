import Image from 'next/image'
import Link from 'next/link'

const productLinks = [
  { href: '/', label: '首页' },
  { href: '/pricing', label: '价格' },
  { href: '/tutorial', label: '微信红包封面配置教程' },
  { href: '/wechat-faq', label: '微信红包封面常见问题' },
  { href: '/faq', label: '常见问题（FAQ）' },
]

const aboutLinks = [
  { href: '/privacy', label: '隐私政策' },
  { href: '/terms', label: '服务协议' },
]

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-border/40 bg-muted/30 border-t">
      <div className="container mx-auto max-w-5xl px-4 py-10 md:py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          {/* Brand Section */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="text-primary flex items-center gap-2 text-lg font-semibold transition-opacity hover:opacity-80"
            >
              <Image
                src="/favicon/android-chrome-192x192.png"
                alt="红包封面 AI"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span>红包封面 AI</span>
            </Link>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              输入一句话，AI 一键生成微信红包封面。
              <br />
              完美适配微信红包封面规范。
            </p>
          </div>

          {/* Links Section */}
          <div className="flex gap-12 md:gap-16">
            {/* Product Links */}
            <div>
              <h3 className="text-foreground mb-3 text-sm font-semibold">
                产品
              </h3>
              <ul className="space-y-2">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About Links */}
            <div>
              <h3 className="text-foreground mb-3 text-sm font-semibold">
                关于
              </h3>
              <ul className="space-y-2">
                {aboutLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border/40 mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row">
          <p className="text-muted-foreground text-center text-sm md:text-left">
            © {currentYear} 红包封面 AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-muted-foreground text-sm">保持独立思考</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
