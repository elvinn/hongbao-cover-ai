'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { AuthButton } from '@/components/auth-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils/tailwind'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/gallery', label: '广场' },
  { href: '/pricing', label: '价格' },
]

const helpItems = [
  { href: '/tutorial', label: '微信红包封面配置教程' },
  { href: '/wechat-faq', label: '微信红包封面常见问题' },
  { href: '/faq', label: '常见问题（FAQ）' },
]

export function SiteHeader() {
  const pathname = usePathname()

  const isHelpActive = helpItems.some((item) => pathname === item.href)

  return (
    <header className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo / Site Name */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-primary flex items-center gap-2 text-lg font-semibold transition-opacity hover:opacity-80"
          >
            <Image
              src="/favicon/android-chrome-192x192.png"
              alt="红包封面 AI"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="hidden sm:inline">红包封面 AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}

            {/* Help Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none',
                  isHelpActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                帮助
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {helpItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'cursor-pointer',
                        pathname === item.href && 'bg-accent',
                      )}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex items-center gap-1 md:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}

          {/* Mobile Help Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex items-center gap-0.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors outline-none',
                isHelpActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              帮助
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {helpItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'cursor-pointer',
                      pathname === item.href && 'bg-accent',
                    )}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Auth Button */}
        <div className="flex items-center">
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
