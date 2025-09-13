import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";

const SearchPage = lazy(() => import("@/routes/SearchPage"));
const DashboardPage = lazy(() => import("@/routes/DashBoardPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="p-6 text-sm text-neutral-600">Loading…</div>
            }
          >
            <SearchPage />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense
            fallback={
              <div className="p-6 text-sm text-neutral-600">Loading…</div>
            }
          >
            <DashboardPage />
          </Suspense>
        ),
      },
    ],
  },
]);

const qc = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
