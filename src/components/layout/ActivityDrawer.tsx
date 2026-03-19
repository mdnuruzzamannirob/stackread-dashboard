'use client'

import { History } from 'lucide-react'
import { useState } from 'react'

export function ActivityDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-muted rounded-lg"
      >
        <History className="size-5" />
      </button>
      {open && (
        <div className="fixed right-0 inset-y-0 w-96 border-l border-border bg-card shadow-lg p-6 z-50 overflow-auto">
          <h3 className="font-semibold text-lg mb-4">Activity</h3>
          <div className="text-sm text-muted-foreground">
            No recent activity
          </div>
        </div>
      )}
    </div>
  )
}
