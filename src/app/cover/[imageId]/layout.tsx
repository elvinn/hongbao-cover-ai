import type { Metadata } from 'next'
import { fetchCoverDetail } from '@/services/gallery'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ imageId: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ imageId: string }>
}): Promise<Metadata> {
  const { imageId } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // 获取封面详情用于生成 metadata（不需要用户 ID）
  const result = await fetchCoverDetail(imageId)

  // 如果封面不存在，返回默认 metadata
  if (!result.success) {
    return {
      title: '封面详情',
      description:
        '查看这个 AI 生成的红包封面，你也可以免费生成属于自己的红包封面！',
      openGraph: {
        title: '红包封面 AI | 查看封面详情',
        description:
          '查看这个 AI 生成的红包封面，你也可以免费生成属于自己的红包封面！',
        url: `/cover/${imageId}`,
      },
    }
  }

  const cover = result.data
  const title = cover.prompt
    ? `红包封面：${cover.prompt.slice(0, 50)}${cover.prompt.length > 50 ? '...' : ''}`
    : '红包封面详情'
  const description = cover.prompt
    ? `查看这个 AI 生成的红包封面「${cover.prompt.slice(0, 80)}${cover.prompt.length > 80 ? '...' : ''}」，你也可以免费生成属于自己的红包封面！`
    : '查看这个 AI 生成的红包封面，你也可以免费生成属于自己的红包封面！'

  return {
    title,
    description,
    openGraph: {
      title: `${title} | 红包封面 AI`,
      description,
      url: `${baseUrl}/cover/${imageId}`,
      images: [
        {
          url: cover.imageUrl,
          width: 957,
          height: 1278,
          alt: cover.prompt || '红包封面',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | 红包封面 AI`,
      description,
      images: [cover.imageUrl],
    },
  }
}

export default function CoverDetailLayout({ children }: LayoutProps) {
  return <>{children}</>
}
