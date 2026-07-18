"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard/discover", label: "Discover" },
  { href: "/dashboard/runs", label: "Runs" },
  { href: "/dashboard/keys", label: "Keys" },
  { href: "/dashboard/balance", label: "Balance" },
];

interface SidebarProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  apiKey,
  onApiKeyChange,
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-2 border-black bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="swiss-line-b p-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <div className="toy-chip flex h-8 w-8 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
              Ae
            </div>
            <span>Dashboard</span>
          </Link>
        </div>

        {/* API key input */}
        <div className="swiss-line-b p-4">
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="aeg_xxxxxxxxxxxx"
            className="w-full rounded-xl border-2 border-black bg-bg px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`mb-1 flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "text-text-secondary hover:bg-bg hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back link */}
        <div className="swiss-line-t p-4">
          <Link
            href="/"
            className="text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            ← Back to site
          </Link>
        </div>
      </aside>
    </>
  );
}
