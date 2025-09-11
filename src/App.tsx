import { Outlet, NavLink } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">
            OpenAlex · Climate in Denmark (2025)
          </div>
          <nav className="ml-auto text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "underline" : "hover:underline"
              }
            >
              Search
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl w-full px-4 py-6 flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-white text-xs text-neutral-500">
        <div className="mx-auto max-w-6xl px-4 py-3">
          Data: OpenAlex. Built for demo use only.
        </div>
      </footer>
    </div>
  );
}
