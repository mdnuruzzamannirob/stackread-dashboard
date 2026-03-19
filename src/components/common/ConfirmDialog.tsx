'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

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
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full">
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

        <div className="flex gap-3 p-6 justify-end">
          <button
            onClick={onCancel}
            disabled={isConfirming || isLoading}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            {cancelLabel || t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
            className={`px-4 py-2 rounded-lg text-primary-foreground disabled:opacity-50 ${isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:opacity-90'}`}
          >
            {isConfirming || isLoading
              ? t('common.loading')
              : confirmLabel || t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
