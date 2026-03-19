'use client'

import { Bell } from 'lucide-react'
import { useState } from 'react'

export function NotificationBell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-muted rounded-lg"
      >
        <Bell className="size-5" />
        <span className="absolute top-1 right-1 size-2 rounded-full bg-red-600"></span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg p-4 z-50">
          <h3 className="font-semibold text-sm mb-4">Notifications</h3>
          <div className="text-sm text-muted-foreground">
            No new notifications
          </div>
        </div>
      )}
    </div>
  )
}
