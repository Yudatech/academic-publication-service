import { useQuery } from "@tanstack/react-query";
import { fetchPublicationsPerInstitution } from "@/api/openalex";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/dashboard-page/BarChart";
import { LoadingCard } from "@/components/LoadingCard";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [enabled, setEnabled] = useState(false);

  const [activeQuery, setActiveQuery] = useState("");
  function startSearch(q?: string) {
    const v = (q ?? searchQuery).trim();
    const ok = v.length >= 2;
    setActiveQuery(ok ? v : "");
    setEnabled(ok);
  }

  const q = useQuery({
    queryKey: ["inst-bar", activeQuery],
    queryFn: () =>
      fetchPublicationsPerInstitution({ search: activeQuery, top: 15 }),
    enabled: enabled,
    staleTime: 5 * 60_000,
  });

  return (
    <div className="space-y-6">
      <h1 className="mb-2 items-center justify-center text-4xl font-bold text-foreground text-center ">
        Research Dashboard
      </h1>
      <p className="text-lg text-muted-foreground text-center">
        Top institutions by publication count from OpenAlex database
      </p>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={startSearch}
      />

      <Card className="rounded-xl border p-4">
        <CardHeader className="flex items-center justify-between mb-3">
          {q.isSuccess && (
            <h2 className="font-medium">
              Publications related to “{activeQuery}” in Denmark (per
              institution)
            </h2>
          )}
          {q.isFetching && !q.isPending && (
            <div className="text-sm text-neutral-600">Refreshing…</div>
          )}
        </CardHeader>

        <CardContent>
          {q.isError ? (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-900 px-4 py-3 text-sm">
              Couldn’t load data.{" "}
              <button className="underline" onClick={() => q.refetch()}>
                Retry
              </button>
            </div>
          ) : q.isPending ? (
            <p className="text-sm text-neutral-600">
              Enter at least 2 characters to search for creating dashboard.
            </p>
          ) : q.isFetching ? (
            <LoadingCard />
          ) : (q.data?.length ?? 0) === 0 ? (
            <div className="text-sm text-neutral-600">No data available.</div>
          ) : (
            <div className="h-[520px]">
              <BarChart search={activeQuery} enabled={enabled} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
