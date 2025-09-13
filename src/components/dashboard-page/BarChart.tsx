import { useQuery } from "@tanstack/react-query";
import { fetchPublicationsPerInstitution } from "@/api/openalex";
import { makeBlueShades } from "@/adapters/utils";
import { lazy, Suspense } from "react";

const Bar = lazy(() =>
  import("react-chartjs-2").then((m) => ({ default: m.Bar }))
);

export function BarChart({
  search,
  enabled,
}: {
  search: string;
  enabled: boolean;
}) {
  const q = useQuery({
    queryKey: ["inst-bar", search],
    queryFn: () => fetchPublicationsPerInstitution({ search: search, top: 15 }),
    enabled: enabled,
    staleTime: 5 * 60_000,
  });

  const labels = (q.data ?? []).map(
    (b) => b.key_display_name || b.key.replace("https://openalex.org/", "")
  );
  const counts = (q.data ?? []).map((b) => b.count);

  const { fills, hovers, borders } = makeBlueShades(counts);

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
      <Bar data={data} options={options} />
    </Suspense>
  );
}
