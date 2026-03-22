'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export interface ConfirmDialogProps {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations()
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-3 p-6 border-b border-border">
          {isDangerous && (
            <AlertTriangle className="size-5 text-red-600 shrink-0" />
          )}
          <h2 className="text-lg font-semibold flex-1">{title}</h2>
          <button
            onClick={onCancel}
            disabled={isConfirming || isLoading}
            className="p-1 hover:bg-muted rounded disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {description && (
          <div className="p-6 border-b border-border">
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 p-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming || isLoading}
          >
            {cancelLabel || t('common.cancel')}
          </Button>
          <Button
            variant={isDangerous ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
          >
            {isConfirming || isLoading
              ? t('common.loading')
              : confirmLabel || t('common.delete')}
          </Button>
        </div>
      </div>
    </div>
  )
}
