import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '封面广场 - 热门红包封面作品精选',
  description:
    '浏览 AI 生成的微信红包封面作品，发现热门封面与创作灵感，快速开启你的专属红包封面制作。',
  openGraph: {
    title: '封面广场 - 热门红包封面作品精选 | 红包封面 AI',
    description:
      '浏览 AI 生成的微信红包封面作品，发现热门封面与创作灵感，快速开启你的专属红包封面制作。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '封面广场 - 热门红包封面作品精选 | 红包封面 AI',
    description:
      '浏览 AI 生成的微信红包封面作品，发现热门封面与创作灵感，快速开启你的专属红包封面制作。',
  },
}

interface LayoutProps {
  children: React.ReactNode
}

export default function GalleryLayout({ children }: LayoutProps) {
  return <>{children}</>
}
