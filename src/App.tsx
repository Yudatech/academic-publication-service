import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
