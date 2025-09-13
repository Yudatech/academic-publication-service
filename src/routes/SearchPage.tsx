import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchWorksPage, type WorksResponse } from "../api/openalex";
import { useState, useMemo, useRef, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import PublicationItem from "@/components/PublicationItem";
import { workDataParser } from "@/adapters/dataParser";
import { type RawWork, RawWorkSchema } from "@/adapters/utils";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("climate change");

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
    select: (data) =>
      data.pages.flatMap((p) =>
        (p.results as unknown[]).map((r) => RawWorkSchema.parse(r))
      ),
  });

  const items: RawWork[] = useMemo(() => query.data ?? [], [query.data]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
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
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  const parsedData = items.map((item) => workDataParser(item));

  return (
    <>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <section aria-live="polite" className="grid gap-3">
        {query.isLoading && (
          <div className="text-sm text-neutral-600">Loading…</div>
        )}
        {query.isError && (
          <div className="text-sm text-red-700">
            Failed to load.{" "}
            <div className="text-sm text-red-700">
              {(query.error as Error)?.message}
            </div>
          </div>
        )}
        {/* {!query.isLoading && all.length === 0 && (
          <div className="text-sm">No results.</div>
        )} */}
        <div className="grid gap-3" aria-live="polite">
          {parsedData &&
            parsedData?.length > 0 &&
            parsedData.map((item, index) => (
              <PublicationItem key={`publish-item-${index}`} item={item} />
            ))}

          {query.hasNextPage && (
            <div
              ref={sentinelRef}
              className="py-6 text-center text-sm text-neutral-500"
            >
              {query.isFetchingNextPage ? "Loading more…" : "Scroll for more"}
            </div>
          )}

          {!query.hasNextPage && items.length > 0 && (
            <div className="py-6 text-center text-xs text-neutral-500">
              — end —
            </div>
          )}
        </div>
      </section>
    </>
  );
}
