import Image from 'next/image'
import { Smartphone, Zap, ShieldCheck } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      title: '精准尺寸匹配',
      desc: '严格遵守官方规范，确保封面在红包展开、拆开各环节完美适配。',
      icon: Smartphone,
    },
    {
      title: 'AI 驱动',
      desc: '基于领先的生成式 AI，理解力更强，支持多种艺术风格创作。',
      icon: Zap,
    },
    {
      title: '版权安全保障',
      desc: 'AI 原创生成，避开网络素材版权风险，让你的封面独一无二。',
      icon: ShieldCheck,
    },
  ]

  return (
    <section className="w-full py-20 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid gap-16 sm:grid-cols-2 sm:items-center">
          <div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              不止是美，更懂
              <br />
              微信红包封面规范
            </h2>
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            {/* WeChat Red Envelope Style Mockup */}
            <div className="relative w-48 sm:w-56">
              {/* Red Envelope Body */}
              <div className="relative aspect-4/7 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
                {/* Base Cover Image */}
                <Image
                  src="https://cdn.hongbao.elvinn.wiki/public/official.jpg"
                  alt="红包封面预览"
                  fill
                  sizes="(max-width: 640px) 12rem, 14rem"
                  className="absolute inset-0 h-full w-full object-cover"
                  unoptimized
                />

                {/* Bottom Flap Overlay */}
                <Image
                  src="https://cdn.hongbao.elvinn.wiki/public/official-bottom.png"
                  alt="红包底部"
                  fill
                  sizes="(max-width: 640px) 12rem, 14rem"
                  className="absolute bottom-0 left-0 w-full object-contain object-bottom"
                  unoptimized
                />

                {/* Glass Reflection Effect */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
