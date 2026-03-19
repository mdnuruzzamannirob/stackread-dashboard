'use client'

import { Search } from 'lucide-react'

export function CommandPalette() {
  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
      <Search className="size-4" />
      <span>Search... (Cmd+K)</span>
    </div>
  )
}
