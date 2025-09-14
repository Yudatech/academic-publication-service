import { lazy, Suspense } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPublicationsPerInstitution } from "@/api/openalex";
import { makeBlueShades } from "@/adapters/utils";

// Lazy-load just the Bar component from react-chartjs-2.
// This keeps the main bundle smaller and improves LCP.
const Bar = lazy(() =>
  import("react-chartjs-2").then((m) => ({ default: m.Bar }))
);

// Shape returned by `fetchPublicationsPerInstitution` group-by API
// (OpenAlex returns `key`, `key_display_name`, `count` for grouped results)
type InstitutionBucket = {
  key: string;
  key_display_name?: string | null;
  count: number;
};

const TOP_N = 15;

/**
 * BarChart
 * - Fetches and renders a bar chart of "publications per institution".
 * - Pass a committed `search` term; component won’t query when `enabled` is false.
 */

export function BarChart({
  search,
  enabled,
}: {
  search: string;
  enabled: boolean;
}) {
  // Guard: if parent says disabled, render a friendly prompt and skip everything
  if (!enabled) {
    return (
      <div className="grid h-80 place-items-center text-sm text-neutral-600">
        Enter a query to generate the chart.
      </div>
    );
  }

  // Fetch grouped counts from OpenAlex, keep previous data during refresh to reduce flicker
  const q = useQuery<InstitutionBucket[], Error>({
    queryKey: ["inst-bar", { search, top: TOP_N }],
    queryFn: () => fetchPublicationsPerInstitution({ search, top: TOP_N }),
    enabled: enabled,
    staleTime: 5 * 60_000, // treat as fresh for 5 minutes
    placeholderData: keepPreviousData,
  });

  // Basic states: pending / error / empty
  if (q.status === "pending") {
    return (
      <div className="grid h-80 place-items-center text-neutral-500">
        Loading data…
      </div>
    );
  }

  if (q.status === "error") {
    return (
      <div className="grid h-80 place-items-center text-sm text-red-700">
        Couldn’t load chart data.{" "}
        <button className="underline ml-1" onClick={() => q.refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const buckets = q.data ?? [];
  if (buckets.length === 0) {
    return (
      <div className="grid h-80 place-items-center text-sm text-neutral-600">
        No data available.
      </div>
    );
  }

  // Derive labels and values.
  const labels = (q.data ?? []).map(
    (b) => b.key_display_name || b.key.replace("https://openalex.org/", "")
  );

  const counts = (q.data ?? []).map((b) => b.count);

  const { fills, hovers, borders } = makeBlueShades(counts);

  // Chart.js data + options
  const data = {
    labels,
    datasets: [
      {
        label: "Publications",
        data: counts,
        backgroundColor: fills,
        hoverBackgroundColor: hovers,
        borderColor: borders,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Publications per institution (Top 15)" },
      tooltip: { mode: "nearest" as const, intersect: false },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { ticks: { autoSkip: false } },
    },
  };

  return (
    <Suspense
      fallback={
        <div className="h-80 grid place-items-center text-neutral-500">
          Loading chart…
        </div>
      }
    >
      <div className="h-[520px]" aria-live="polite">
        <Bar data={data} options={options} />
      </div>
    </Suspense>
  );
}
