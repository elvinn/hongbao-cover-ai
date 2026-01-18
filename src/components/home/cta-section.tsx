import Link from 'next/link'

export function CTASection() {
  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="bg-primary absolute inset-0 -z-10" />
      <div className="absolute top-0 left-0 h-full w-full opacity-10 [background:radial-gradient(circle_at_center,#fff,transparent_70%)]" />

      <div className="relative container mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          现在就开始制作
          <br />
          你的专属红包封面
        </h2>
        <p className="mb-10 text-lg text-white/80">
          送出独一无二的祝福，让你的红包在群聊中脱颖而出。
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#generation-form"
            className="text-primary inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 text-lg font-bold shadow-xl transition-transform hover:scale-105"
          >
            立即免费生成
          </a>
          <Link
            href="/gallery"
            className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-10 text-lg font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            浏览灵感广场
          </Link>
        </div>
      </div>
    </section>
  )
}
