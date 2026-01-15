import * as React from 'react'

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl border border-slate-200/60 bg-white p-2 shadow-sm"
        >
          <div className="animate-pulse">
            {/* Cover Image Placeholder */}
            <div className="aspect-[1/1.65] rounded-xl bg-slate-100" />

            {/* Info Section Placeholder */}
            <div className="mt-3 space-y-3 px-1">
              {/* Prompt Placeholder */}
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-slate-100" />
                <div className="h-3 w-2/3 rounded-full bg-slate-100" />
              </div>

              {/* Footer Placeholder */}
              <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-100" />
                  <div className="h-2.5 w-8 rounded-full bg-slate-100" />
                </div>
                <div className="h-2 w-16 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
