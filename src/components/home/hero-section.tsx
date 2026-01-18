import { Sparkles, CheckCircle2 } from 'lucide-react'

export function HeroSection() {
  return (
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[120px] [background:radial-gradient(circle_farthest-side,rgba(220,38,38,0.15),transparent)]" />

      <header className="relative text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-red-200/50 bg-red-50/50 px-4 py-1.5 text-sm font-medium text-red-700 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          <span>2026 马年·新春贺岁版正式上线</span>
        </div>

        <h1 className="text-primary mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          让祝福更有“面”
        </h1>
        <h2 className="text-muted-foreground mx-auto max-w-3xl text-lg font-normal sm:text-xl">
          AI 驱动，一句话生成专属红包封面
        </h2>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>免费体验</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>完美适配</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>高清无水印</span>
          </div>
        </div>
      </header>
    </div>
  )
}
