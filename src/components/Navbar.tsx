import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { Search, BarChart3, Menu, X } from "lucide-react";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
    isActive
      ? "bg-black/90 text-white"
      : "hover:bg-neutral-100 text-neutral-700",
  ].join(" ");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            OpenAlex Explorer
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              <Search className="h-4 w-4" /> Search
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              <BarChart3 className="h-4 w-4" /> Dashboard
            </NavLink>
          </nav>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-md border px-2.5 py-2"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-3">
            <nav className="flex flex-col gap-1">
              <NavLink
                to="/"
                end
                className={navClass}
                onClick={() => setOpen(false)}
              >
                <Search className="h-4 w-4" /> Search
              </NavLink>
              <NavLink
                to="/dashboard"
                className={navClass}
                onClick={() => setOpen(false)}
              >
                <BarChart3 className="h-4 w-4" /> Dashboard
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
