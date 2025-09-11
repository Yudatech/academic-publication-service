import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchWorksPage } from "../api/openalex";
import { useState } from "react";

export default function SearchPage() {
  const [search, setSearch] = useState("climate change");

  const query = useInfiniteQuery({
    queryKey: ["works", search],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorksPage({ search, page: pageParam, perPage: 50 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, per_page, count } = last.meta;
      const maxPage = Math.ceil(count / per_page);
      return page < maxPage ? page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const all: any[] = query.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <>
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
        {!query.isLoading && all.length === 0 && (
          <div className="text-sm">No results.</div>
        )}
        {all.map((w) => (
          <>
            <div>{w.id}</div>
            <div>{w.title}</div>
          </>
        ))}
      </section>
    </>
  );
}
