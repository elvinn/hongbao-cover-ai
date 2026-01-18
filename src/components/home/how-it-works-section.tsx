export function HowItWorksSection() {
  return (
    <section className="relative w-full overflow-hidden border-y border-red-100/30 bg-white/40 py-20 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            简单 3 步，拥有专属封面
          </h2>
          <p className="text-muted-foreground">无需设计基础，人人都是设计师</p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Desktop Connector Line */}
          <div className="absolute top-5 right-[16.6%] left-[16.6%] hidden h-px bg-slate-200 sm:block" />

          <div className="grid gap-12 sm:grid-cols-3 sm:gap-4">
            {[
              {
                step: '1',
                title: '输入描述',
                desc: '用文字描述你想要的画面，如"红金配色的锦鲤"',
              },
              {
                step: '2',
                title: 'AI 创作',
                desc: 'AI 深度理解语义，快速生成多款精美封面图',
              },
              {
                step: '3',
                title: '下载使用',
                desc: '获取高清原图，通过微信红包封面平台提交审核',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative flex flex-row items-start gap-4 sm:flex-col sm:items-center sm:text-center"
              >
                {/* Mobile Connector Line */}
                {idx !== 2 && (
                  <div className="absolute top-10 bottom-[-48px] left-5 w-px bg-slate-200 sm:hidden" />
                )}

                <div className="group-hover:border-primary group-hover:text-primary relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-900 shadow-xs transition-all duration-300">
                  {item.step}
                </div>

                <div className="pt-1 sm:pt-2">
                  <h3 className="group-hover:text-primary mb-2 text-lg font-bold text-slate-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:px-4">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
