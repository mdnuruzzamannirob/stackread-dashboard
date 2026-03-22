'use client'

import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface DataTableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
  width?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  onAdd?: () => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onView?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  noDataMessage?: string
  onSearchChange?: (value: string) => void
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
}

type SortDirection = 'asc' | 'desc' | null
type SortKey = string | null

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  searchPlaceholder,
  noDataMessage,
  onSearchChange,
  page = 1,
  pageSize = data.length || 1,
  total,
  onPageChange,
}: DataTableProps<T>) {
  const t = useTranslations()
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="size-4" />
    if (sortDirection === 'asc') return <ChevronUp className="size-4" />
    return <ChevronDown className="size-4" />
  }

  const sortedAndFilteredData = useMemo(() => {
    let result = [...data]

    // Filter
    if (searchTerm) {
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.key]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        }),
      )
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey as keyof T]
        const bVal = b[sortKey as keyof T]

        if (aVal === bVal) return 0
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        return sortDirection === 'asc' ? 1 : -1
      })
    }

    return result
  }, [data, sortKey, sortDirection, searchTerm, columns])

  const totalPages =
    typeof total === 'number' && pageSize > 0
      ? Math.max(1, Math.ceil(total / pageSize))
      : 1
  const hasPagination =
    typeof total === 'number' && typeof onPageChange === 'function'
  const startItem =
    hasPagination && total
      ? Math.min((page - 1) * pageSize + 1, total)
      : sortedAndFilteredData.length > 0
        ? 1
        : 0
  const endItem = hasPagination
    ? Math.min(page * pageSize, total || 0)
    : sortedAndFilteredData.length

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {searchable && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder || t('common.search')}
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value
                setSearchTerm(value)
                onSearchChange?.(value)
              }}
              className="pl-10"
            />
          </div>
        )}
        {onAdd && (
          <Button onClick={onAdd} className="h-10 gap-2 px-4">
            <Plus className="size-4" />
            {t('common.add')}
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border bg-muted">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-sm font-semibold ${col.width ? `w-${col.width}` : ''}`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(String(col.key))}
                      className="flex items-center gap-2 hover:text-foreground text-muted-foreground"
                    >
                      {col.label}
                      {getSortIcon(String(col.key))}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  {t('common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (onView || onEdit || onDelete ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {noDataMessage || t('common.noResults')}
                </td>
              </tr>
            ) : (
              sortedAndFilteredData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border hover:bg-muted/50"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm">
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key])}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onView && (
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => onView(row)}
                            title="View details"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => onEdit(row)}
                            title={t('common.edit')}
                          >
                            <Pencil className="size-3.5 text-primary" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => onDelete(row)}
                            title={t('common.delete')}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasPagination && totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {startItem}-{endItem} of {total || 0} items
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="min-w-20 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
