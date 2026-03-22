'use client'

import { BookOpen } from 'lucide-react'
import Link from 'next/link'

interface BrandLogoProps {
  href: string
  collapsed?: boolean
}

export function BrandLogo({ href, collapsed = false }: BrandLogoProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
    >
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BookOpen className="size-4" />
      </span>
      {!collapsed && (
        <span className="text-sm font-semibold tracking-tight">Stackread</span>
      )}
    </Link>
  )
}
