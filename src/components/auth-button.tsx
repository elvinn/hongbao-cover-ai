'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ImageIcon, TicketIcon } from 'lucide-react'
import { Button } from './ui/button'

export function AuthButton() {
  return (
    <>
      <SignedOut>
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <Button size="sm" variant="outline">
              登录
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm" variant="default">
              注册
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Link
              label="我的封面"
              labelIcon={<ImageIcon className="h-4 w-4" />}
              href="/my-gallery"
            />
            <UserButton.Link
              label="兑换码兑换"
              labelIcon={<TicketIcon className="h-4 w-4" />}
              href="/redeem"
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </>
  )
}
