"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApiKey } from "@/components/ApiKeyContext"

const NAV_ITEMS = [
  { label: "Discover", href: "/dashboard/discover", icon: SearchIcon },
  { label: "Runs", href: "/dashboard/runs", icon: RunsIcon },
  { label: "Keys", href: "/dashboard/keys", icon: KeyIcon },
  { label: "Balance", href: "/dashboard/balance", icon: BalanceIcon },
]

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const { apiKey, setApiKey } = useApiKey()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-bg-elevated transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent text-sm font-bold text-white">
            Ae
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Aegntic</div>
            <div className="text-xs text-text-muted">Dashboard</div>
          </div>
        </div>

        <div className="px-4 py-4">
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="aegntic_live_..."
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          />
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border px-5 py-4 text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-text-primary">
            &larr; Back to site
          </Link>
        </div>
      </aside>
    </>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m14 14 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function RunsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="3" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="12" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="7" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m9.5 10.5 7-7M14 4l2 2M12 6l2 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BalanceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v8M8 8h2.5a1.5 1.5 0 0 1 0 3H8m0 0h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
