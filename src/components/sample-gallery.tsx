'use client'

import { useEffect, useState } from 'react'
import { getSampleCovers } from '@/api/mock-cover'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'
import type { SampleCover as SampleCoverType } from '@/types/hongbao'

function Skeleton() {
  return (
    <div className="bg-muted/50 aspect-4/7 w-full animate-pulse rounded-xl" />
  )
}

export function SampleGallery() {
  const [samples, setSamples] = useState<SampleCoverType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSampleCovers().then((data) => {
      setSamples(data)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="hb-section-title text-lg">示例封面</h2>
        <p className="hb-section-subtitle text-sm">参考以下示例，获取灵感</p>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
          : samples.map((sample) => (
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
