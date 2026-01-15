import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '封面广场',
  description:
    '浏览用户分享的 AI 生成红包封面作品，获取灵感，或生成属于你自己的专属封面！',
  openGraph: {
    title: '封面广场 | 红包封面 AI',
    description:
      '浏览用户分享的 AI 生成红包封面作品，获取灵感，或生成属于你自己的专属封面！',
  },
}

interface LayoutProps {
  children: React.ReactNode
}

export default function GalleryLayout({ children }: LayoutProps) {
  return <>{children}</>
}
