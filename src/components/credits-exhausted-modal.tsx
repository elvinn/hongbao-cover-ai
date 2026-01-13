'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CreditsExhaustedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreditsExhaustedModal({
  open,
  onOpenChange,
}: CreditsExhaustedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>生成次数已用完</DialogTitle>
          <DialogDescription>
            您的套餐生成次数已全部使用，请购买新的套餐继续生成
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-amber-50/70 p-4 text-center">
            <p className="text-sm text-amber-900">
              购买套餐后即可继续生成高清无水印封面
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            稍后再说
          </Button>
          <Link href="/pricing">
            <Button className="hb-btn-primary">立即购买</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
