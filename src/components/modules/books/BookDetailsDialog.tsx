'use client'

import { Book } from '@/store/api/booksApi'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ExternalLink, FileText, X } from 'lucide-react'

const ReactReader = dynamic(
  () => import('react-reader').then((mod) => mod.ReactReader),
  { ssr: false },
)

interface BookDetailsDialogProps {
  book: Book
  onClose: () => void
}

export function BookDetailsDialog({ book, onClose }: BookDetailsDialogProps) {
  const [location, setLocation] = useState<string | number>(0)

  const files = useMemo(
    () => (Array.isArray(book.files) ? book.files : []),
    [book.files],
  )
  const defaultFile = useMemo(
    () => files.find((file) => file.format === 'epub') ?? files[0],
    [files],
  )
  const [selectedFileId, setSelectedFileId] = useState<string>(
    defaultFile?.id || '',
  )

  const selectedFile =
    files.find((file) => file.id === selectedFileId) ?? defaultFile ?? null
  const format = selectedFile?.format?.toLowerCase() || ''
  const isEpub = format === 'epub'
  const isPdf = format === 'pdf'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{book.title}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {book.summary}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Close details"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4 overflow-y-auto rounded-xl border border-border bg-background p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Metadata
              </p>
              <p className="text-sm">
                <span className="font-medium">Language:</span>{' '}
                {book.language || '—'}
              </p>
              <p className="text-sm">
                <span className="font-medium">ISBN:</span> {book.isbn || '—'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Pages:</span>{' '}
                {book.pageCount || '—'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Access:</span> {book.accessLevel}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Files
              </p>
              {files.length > 0 ? (
                <Select
                  value={selectedFileId}
                  onChange={(event) => setSelectedFileId(event.target.value)}
                >
                  {files.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.originalFileName} ({file.format.toUpperCase()})
                    </option>
                  ))}
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No uploaded files
                </p>
              )}
            </div>

            {selectedFile && (
              <a
                href={selectedFile.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="size-4" />
                Open file in new tab
              </a>
            )}

            {book.description && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </p>
                <p className="text-sm text-muted-foreground">
                  {book.description}
                </p>
              </div>
            )}

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {!selectedFile && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <FileText className="size-4" />
                  No readable file selected
                </div>
              </div>
            )}

            {selectedFile && isPdf && (
              <iframe
                src={selectedFile.url}
                title={`${book.title} PDF reader`}
                className="h-full w-full"
              />
            )}

            {selectedFile && isEpub && (
              <div className="h-full w-full">
                <ReactReader
                  url={selectedFile.url}
                  location={location}
                  locationChanged={(epubLocation: string) =>
                    setLocation(epubLocation)
                  }
                />
              </div>
            )}

            {selectedFile && !isPdf && !isEpub && (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                This file format is not previewable in-app yet. Use the Open
                file link.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
