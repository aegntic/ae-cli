"use client"

import { useState } from "react"
import { ApiKeyProvider, useApiKey } from "@/components/ApiKeyContext"
import Sidebar from "@/components/ui/Sidebar"

function ShellInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { apiKey, setApiKey } = useApiKey()

  return (
    <div className="flex min-h-screen bg-bg text-text-primary">
      <Sidebar
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-border p-2 text-text-secondary transition-colors hover:text-text-primary"
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-semibold">Aegntic Dashboard</span>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ApiKeyProvider>
      <ShellInner>{children}</ShellInner>
    </ApiKeyProvider>
  )
}
