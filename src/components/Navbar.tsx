import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { Search, BarChart3, Menu, X } from "lucide-react";

/** Utility: merge class strings (tiny "cn") */
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Compute link classes based on NavLink's isActive flag */
function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600",
    isActive
      ? "bg-black/90 text-white"
      : "text-neutral-700 hover:bg-neutral-100"
  );
}

/** Central list of nav items to keep markup DRY */
const NAV_ITEMS = [
  { to: "/", label: "Search", icon: Search },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            OpenAlex Explorer
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={navLinkClass}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile toggle button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border px-2.5 py-2 md:hidden focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu (collapsible) */}
        <div
          id="mobile-nav"
          className={cn(
            "md:hidden pb-3 transition-[max-height,opacity] duration-200",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          )}
          aria-hidden={!open}
        >
          <nav className="flex flex-col gap-1 pt-1" aria-label="Mobile primary">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={navLinkClass}
                onClick={() => setOpen(false)} // redundant due to route effect, but snappy
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
