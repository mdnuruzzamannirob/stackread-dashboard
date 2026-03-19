'use client'

import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Delete,
  Edit,
  Plus,
  Search,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

export interface DataTableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: string, row: T) => React.ReactNode
  width?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  onAdd?: () => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  noDataMessage?: string
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
  searchable = true,
  searchPlaceholder,
  noDataMessage,
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
            <input
              type="text"
              placeholder={searchPlaceholder || t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            <Plus className="size-4" />
            {t('common.add')}
          </button>
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
              {(onEdit || onDelete) && (
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
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
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
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1 hover:bg-muted rounded"
                            title={t('common.edit')}
                          >
                            <Edit className="size-4 text-primary" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1 hover:bg-muted rounded"
                            title={t('common.delete')}
                          >
                            <Delete className="size-4 text-red-600" />
                          </button>
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
    </div>
  )
}
