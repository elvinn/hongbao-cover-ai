'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, BookOpen, HelpCircle, MessageCircle } from 'lucide-react'
import { AuthButton } from '@/components/auth-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils/tailwind'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/gallery', label: '广场' },
  { href: '/pricing', label: '价格' },
]

const helpItems = [
  {
    href: '/tutorial',
    label: '配置教程',
    icon: BookOpen,
    description: '手把手教你上传封面',
  },
  {
    href: '/wechat-faq',
    label: '微信规范',
    icon: MessageCircle,
    description: '官方审核要求说明',
  },
  {
    href: '/faq',
    label: '常见问题',
    icon: HelpCircle,
    description: '使用过程中的疑难解答',
  },
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
                  'flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none',
                  isHelpActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                帮助
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2">
                <DropdownMenuGroup>
                  {helpItems.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      asChild
                      className="focus:bg-accent cursor-pointer rounded-lg p-2"
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-start gap-3',
                          pathname === item.href && 'bg-accent',
                        )}
                      >
                        <div className="bg-primary/10 text-primary mt-0.5 rounded-md p-1.5">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm leading-none font-medium">
                            {item.label}
                          </span>
                          <span className="text-muted-foreground text-[11px] leading-tight">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
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
                'flex cursor-pointer items-center gap-0.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors outline-none',
                isHelpActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              帮助
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2">
              <DropdownMenuGroup>
                {helpItems.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    asChild
                    className="focus:bg-accent cursor-pointer rounded-lg p-2"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2',
                        pathname === item.href && 'bg-accent',
                      )}
                    >
                      <item.icon className="text-primary h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
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
