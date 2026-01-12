import { SAMPLE_COVERS } from '@/types/hongbao'
import { COVER_IMAGE_WIDTH, COVER_IMAGE_HEIGHT } from '@/utils/prompts'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'

export function SampleGallery() {
  const samples = SAMPLE_COVERS.map((cover) => ({
    ...cover,
    imageUrl: `https://picsum.photos/seed/${cover.id}/${COVER_IMAGE_WIDTH}/${COVER_IMAGE_HEIGHT}`,
  }))

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="hb-section-title text-lg">示例封面</h2>
        <p className="hb-section-subtitle text-sm">参考以下示例，获取灵感</p>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6">
        {samples.map((sample) => (
          <div key={sample.id} className="w-full">
            <RedEnvelopeCover
              imageUrl={sample.imageUrl}
              className="w-full shadow-sm"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
