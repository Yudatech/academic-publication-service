import { useEffect, useMemo, useRef, useState } from "react";
import { fetchWorksPage, type WorksResponse } from "../api/openalex";
import { type RawWork, RawWorkSchema } from "@/adapters/dataSchema";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import PublicationItem from "@/components/PublicationItem";
import { workDataParser } from "@/adapters/dataParser";
import { type Publication } from "@/types/openalex";
import ItemOverlay from "./ItemOverlay";
import { Skeleton } from "./ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InfiniteList<T>({
  searchQuery,
  enabled = true,
}: {
  searchQuery: string;
  enabled?: boolean;
}) {
  const query = useInfiniteQuery<
    WorksResponse<RawWork>,
    Error,
    RawWork[],
    ["works", string],
    number
  >({
    queryKey: ["works", searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorksPage({ search: searchQuery, page: pageParam, perPage: 25 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, per_page, count } = last.meta;
      const maxPage = Math.ceil(count / per_page);
      return page < maxPage ? page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
    select: (data) =>
      data.pages.flatMap((p) =>
        (p.results as unknown[]).map((r) => RawWorkSchema.parse(r))
      ),
  });

  const items: RawWork[] = useMemo(() => query.data ?? [], [query.data]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          query.fetchNextPage();
        }
      },
      { root: null, rootMargin: "800px 0px 800px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [
    enabled,
    query.hasNextPage,
    query.isFetchingNextPage,
    query.fetchNextPage,
  ]);

  const [selected, setSelected] = useState<Publication | null>(null);

  if (query.status === "pending") {
    return (
      <div className="space-y-2" aria-busy="true" aria-live="polite">
        <p className="text-sm text-neutral-600">Pending ...</p>
      </div>
    );
  }

  if (query.fetchStatus === "fetching" || query.isFetching === true) {
    return (
      <Card className="h-[260px] flex flex-col overflow-hidden rounded-xl border hover:shadow-lg transition-shadow">
        <CardHeader className="p-6 pb-2">
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="px-6 py-2 flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter className="px-6 py-4 mt-auto">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (query.status === "error" || query.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Unable to process your payment.</AlertTitle>
        <AlertDescription>
          <p>Please verify your billing information and try again.</p>
        </AlertDescription>
      </Alert>
    );
  }

  const parsedData = items.map((item) => workDataParser(item));

  return (
    <div className="space-y-3" aria-live="polite">
      {items.length === 0 && (
        <p className="text-sm text-neutral-600">No results.</p>
      )}

      {parsedData.map((item, index) => (
        <PublicationItem
          key={`publish-item-${index}`}
          item={item}
          onOpen={() => setSelected(item)}
        />
      ))}

      {query.hasNextPage && (
        <div
          ref={sentinelRef}
          className="py-6 text-center text-sm text-neutral-500"
        >
          {query.isFetchingNextPage ? "Loading more…" : "Scroll for more"}
        </div>
      )}

      <ItemOverlay
        open={!!selected}
        setDialogOpen={() => setSelected(null)}
        item={selected}
      />
    </div>
  );
}
