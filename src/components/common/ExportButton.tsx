'use client'

import { Download } from 'lucide-react'

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf'

interface ExportButtonProps {
  data: any[]
  filename: string
  formats?: ExportFormat[]
  onExport?: (format: ExportFormat) => Promise<void> | void
  isLoading?: boolean
}

export function ExportButton({
  data,
  filename,
  formats = ['csv', 'excel', 'json'],
  onExport,
  isLoading = false,
}: ExportButtonProps) {
  const handleExport = async (format: ExportFormat) => {
    try {
      if (onExport) {
        await onExport(format)
        return
      }

      let content = ''
      let mimeType = 'text/plain'
      let fileExtension = format

      switch (format) {
        case 'csv':
          content = convertToCSV(data)
          mimeType = 'text/csv'
          break
        case 'json':
          content = JSON.stringify(data, null, 2)
          mimeType = 'application/json'
          break
        case 'excel':
          content = convertToCSV(data)
          mimeType = 'application/vnd.ms-excel'
          fileExtension = 'csv'
          break
        default:
          return
      }

      downloadFile(content, `${filename}.${fileExtension}`, mimeType)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (formats.length === 1) {
    return (
      <button
        onClick={() => handleExport(formats[0])}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 text-sm"
      >
        <Download className="size-4" />
        Export
      </button>
    )
  }

  return (
    <div className="relative group">
      <button
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 text-sm"
      >
        <Download className="size-4" />
        Export
      </button>
      <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        {formats.map((format) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            className="block w-full text-left px-4 py-2 hover:bg-muted text-sm first:rounded-t-lg last:rounded-b-lg"
          >
            {format.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`
          }
          return value ?? ''
        })
        .join(','),
    ),
  ].join('\n')

  return csvContent
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
