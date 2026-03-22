'use client'

import { BookOpen, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface BrandLogoProps {
  href: string
  collapsed?: boolean
  onExpand?: () => void
}

export function BrandLogo({
  href,
  collapsed = false,
  onExpand,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
    >
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BookOpen className="size-4" />
      </span>
      {!collapsed && (
        <span className="text-sm font-semibold tracking-tight">Stackread</span>
      )}
      {collapsed && onExpand && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            onExpand()
          }}
          className="absolute -right-1.5 top-1/2 hidden size-5 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm group-hover:inline-flex"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <ChevronRight className="size-3" />
        </button>
      )}
    </Link>
  )
}
