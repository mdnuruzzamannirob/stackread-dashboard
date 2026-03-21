'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export interface MultiSelectOption {
  id: string
  name: string
}

interface MultiSelectProps {
  label?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select items...',
  error,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const selectedNames = options
    .filter((opt) => value.includes(opt.id))
    .map((opt) => opt.name)
    .join(', ')

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-left flex items-center justify-between hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            className={
              selectedNames ? 'text-foreground' : 'text-muted-foreground'
            }
          >
            {selectedNames || placeholder}
          </span>
          <ChevronDown className="size-4 opacity-50" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-border rounded-lg bg-card shadow-lg z-50 max-h-64 overflow-y-auto">
            {options.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(option.id)}
                      onChange={() => toggleOption(option.id)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{option.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  )
}
