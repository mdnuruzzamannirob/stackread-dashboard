'use client'

import { FieldError } from '@/components/common/FieldError'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
      {label && <Label className="block">{label}</Label>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
            {options.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {options.map((option, index) => (
                  <Label
                    key={index}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={value.includes(option.id)}
                      onChange={() => toggleOption(option.id)}
                    />
                    <span className="text-sm">{option.name}</span>
                  </Label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <FieldError message={error} />
    </div>
  )
}
