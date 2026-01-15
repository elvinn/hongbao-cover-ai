import type { Metadata } from 'next'

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

export default function CoverDetailLayout({ children }: LayoutProps) {
  return <>{children}</>
}
