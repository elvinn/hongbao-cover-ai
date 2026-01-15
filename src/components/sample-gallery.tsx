import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SAMPLE_COVERS } from '@/types/hongbao'
import { COVER_IMAGE_WIDTH, COVER_IMAGE_HEIGHT } from '@/utils/prompts'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'

export function SampleGallery() {
  const samples = SAMPLE_COVERS.slice(0, 6).map((cover) => ({
    ...cover,
    imageUrl: `https://picsum.photos/seed/${cover.id}/${COVER_IMAGE_WIDTH}/${COVER_IMAGE_HEIGHT}`,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            灵感图库
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            参考由 AI 生成的精美封面
          </p>
        </div>
        <Link
          href="/gallery"
          className="group text-primary inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
        >
          查看灵感广场
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="scrollbar-hide -mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0">
        <div className="flex flex-nowrap gap-4 px-4 sm:contents sm:gap-0 sm:px-0">
          {samples.map((sample) => (
            <div key={sample.id} className="w-[140px] shrink-0 sm:w-auto">
              <RedEnvelopeCover
                imageUrl={sample.imageUrl}
                className="w-full transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 sm:hover:-translate-y-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
