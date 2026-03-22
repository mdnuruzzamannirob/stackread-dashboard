import * as React from 'react'

import { cn } from '@/lib/utils'

function Checkbox({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        'size-4 rounded border border-input bg-background text-primary accent-primary shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Checkbox }
