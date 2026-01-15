'use client'

import { cn } from '@/utils/tailwind'

export interface SegmentOption<T extends string> {
  readonly value: T
  readonly label: string
}

interface SegmentToggleProps<T extends string> {
  readonly options: readonly SegmentOption<T>[]
  readonly value: T
  readonly onChange: (value: T) => void
  readonly className?: string
}

export function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentToggleProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.value === value)

  return (
    <div
      className={cn(
        'relative flex items-center rounded-xl bg-amber-50/50 p-1 backdrop-blur-sm',
        className,
      )}
    >
      {/* Sliding Background */}
      <div
        className="absolute inset-y-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          left: '4px',
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />

      {/* Options */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative z-10 flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
            value === option.value
              ? 'text-red-600'
              : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
