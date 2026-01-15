import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import './globals.css'
import ReactQueryProvider from '@/providers/react-query-provider'
import { SessionProvider } from '@/providers/session-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const defaultUrl = process.env.VERCEL_URL
  ? 'https://hongbao.elvinn.wiki'
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: '红包封面 AI - 让祝福更有“面” | 一句话生成微信红包封面',
    template: '%s | 红包封面 AI',
  },
  description:
    '红包封面 AI 助你让祝福更有“面”。输入一句话描述，即可生成 2026 马年专属微信红包封面。支持春节、生日等多场景定制，尺寸符合官方规范，分享更有仪式感。',
  keywords: [
    '红包封面',
    '微信红包封面',
    '红包封面制作',
    'AI生成红包封面',
    '2026红包封面',
    '新年红包封面',
    '自定义红包封面',
    '红包封面生成器',
    '红包封面 AI',
    '在线制作红包封面',
    '免费红包封面',
  ],
  authors: [{ name: '红包封面 AI' }],
  creator: '红包封面 AI',
  publisher: '红包封面 AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: defaultUrl,
    siteName: '红包封面 AI',
    title: '红包封面 AI - 让祝福更有“面” | 一句话生成微信红包封面',
    description:
      '红包封面 AI 助你让祝福更有“面”。输入一句话描述，即可生成 2026 马年专属微信红包封面。支持春节、生日等多场景定制，尺寸符合官方规范，分享更有仪式感。',
    images: [
      {
        url: '/favicon/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: '红包封面 AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hongbao',
    creator: '@hongbao',
    title: '红包封面 AI - 让祝福更有“面” | 一句话生成微信红包封面',
    description:
      '红包封面 AI 助你让祝福更有“面”。输入一句话描述，即可生成 2026 马年专属微信红包封面。支持春节、生日等多场景定制，尺寸符合官方规范，分享更有仪式感。',
    images: ['/favicon/android-chrome-512x512.png'],
  },
  icons: {
    icon: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
  alternates: {
    canonical: defaultUrl,
  },
}

type RootLayoutProps = {
  children: React.ReactNode
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '红包封面 AI',
  description:
    '红包封面 AI 助你让祝福更有“面”。输入一句话描述，即可生成 2026 马年专属微信红包封面。支持春节、生日等多场景定制，尺寸符合官方规范，分享更有仪式感。',
  url: 'https://hongbao.elvinn.wiki',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY',
    description: '免费体验1次AI生成',
  },
  featureList: [
    'AI一键生成红包封面',
    '支持多种场景（新年、春节、生日、祝福）',
    '符合微信红包封面尺寸规范',
    '高清无水印下载',
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '生成的封面可以直接在微信使用吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '是的。生成的红包封面图片符合微信红包封面官方尺寸规范（957×1278）。下载原图后，在微信红包封面开放平台提交审核即可使用。',
      },
    },
    {
      '@type': 'Question',
      name: '审核一般需要多久？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '微信红包封面官方审核通常需要 1-3 个工作日。建议在春节或节日前提前制作你的红包封面。',
      },
    },
    {
      '@type': 'Question',
      name: '水印如何去除？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '购买任意套餐后，AI 生成的红包封面会自动去除水印，并提供高清原图下载。',
      },
    },
  ],
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.hongbao.elvinn.wiki" />
        <link rel="dns-prefetch" href="https://cdn.hongbao.elvinn.wiki" />
        <link
          rel="preconnect"
          href="https://chinese-fonts-cdn.deno.dev"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://chinese-fonts-cdn.deno.dev/packages/lxgwwenkai/dist/lxgwwenkai-regular/result.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Suspense fallback={null}>
          <ClerkProvider dynamic localization={zhCN}>
            <NextTopLoader showSpinner={false} height={2} color="#7A1F1F" />
            <ThemeProvider
              attribute="class"
              forcedTheme="light"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              <ReactQueryProvider>
                <SessionProvider>
                  <div className="relative min-h-screen">
                    <div className="hb-bg" aria-hidden="true" />
                    {/* Global Background Decoration */}
                    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                      <div className="absolute -top-[5%] -right-[10%] h-[40%] w-[40%] rounded-full bg-red-500/5 blur-[120px]" />
                      <div className="absolute top-[30%] -left-[10%] h-[30%] w-[30%] rounded-full bg-orange-500/5 blur-[100px]" />
                      <div className="absolute right-[20%] -bottom-[5%] h-[25%] w-[25%] rounded-full bg-red-500/5 blur-[80px]" />
                    </div>
                    <div className="relative z-10 flex min-h-screen flex-col">
                      <SiteHeader />
                      <div className="flex-1">{children}</div>
                      <SiteFooter />
                    </div>
                  </div>
                  <Analytics />
                  <Toaster position="top-center" richColors />
                  <ReactQueryDevtools initialIsOpen={false} />
                </SessionProvider>
              </ReactQueryProvider>
            </ThemeProvider>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  )
}
