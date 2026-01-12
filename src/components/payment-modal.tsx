'use client'

import { useState } from 'react'
import { Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentSuccess: () => void
}

export function PaymentModal({
  open,
  onOpenChange,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '支付失败')
      }

      if (data.success) {
        onPaymentSuccess()
        onOpenChange(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '支付失败，请稍后重试')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>解锁完整功能</DialogTitle>
          <DialogDescription>
            支付 ¥3.99 解锁高清无水印封面 + 额外1次生成机会
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                高清无水印封面
              </span>
              <span className="text-sm font-medium text-green-600">已解锁</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                额外生成次数
              </span>
              <span className="text-sm font-medium text-green-600">+1 次</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 rounded-md border p-4">
            <CreditCard className="text-muted-foreground h-5 w-5" />
            <span className="text-muted-foreground text-sm">
              支付金额:{' '}
              <span className="text-foreground font-medium">¥3.99</span>
            </span>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <p className="text-muted-foreground text-center text-xs">
            支付成功后自动解锁，无需人工处理
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            取消
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                支付中...
              </>
            ) : (
              '立即支付 ¥3.99'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
