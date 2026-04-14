'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useBulkImportBooksMutation } from '@/store/api/booksApi'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { useState } from 'react'
import { toast } from 'sonner'

const samplePayload = `{
  "books": [
    {
      "title": "Sample Title",
      "slug": "sample-title",
      "summary": "A short summary for import.",
      "language": "en",
      "authorIds": ["65f19a9a6f8f4a2b3c4d5e6f"],
      "categoryIds": ["65f19a9a6f8f4a2b3c4d5e6f"],
      "accessLevel": "free",
      "status": "draft",
      "availabilityStatus": "available"
    }
  ]
}`

export default function ImportBooksPage() {
  const [payload, setPayload] = useState(samplePayload)
  const [bulkImportBooks, { isLoading }] = useBulkImportBooksMutation()

  const handleSubmit = async () => {
    try {
      const parsed = JSON.parse(payload) as {
        books: Array<Record<string, unknown>>
      }

      if (!Array.isArray(parsed.books) || parsed.books.length === 0) {
        toast.error('Provide at least one book')
        return
      }

      await bulkImportBooks({ books: parsed.books }).unwrap()
      toast.success('Books imported successfully')
    } catch {
      toast.error('Invalid JSON payload')
    }
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.BOOKS_MANAGE}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Import Books</h1>
          <p className="text-sm text-muted-foreground">
            Paste a JSON payload that matches the backend bulk import schema.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-5 sm:p-6">
          <Textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            className="min-h-90 font-mono text-sm"
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Importing...' : 'Import'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPayload(samplePayload)}
              disabled={isLoading}
            >
              Reset Example
            </Button>
          </div>
        </div>
      </div>
    </PermissionGuard>
  )
}
