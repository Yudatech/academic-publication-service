import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchWorksPage, type WorksResponse } from "../api/openalex";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import PublicationItem from "@/components/PublicationItem";
import { workDataParser } from "@/adapters/dataParser";
import { type RawWork, RawWorkSchema } from "@/adapters/utils";

export default function SearchPage() {
  const [search, setSearch] = useState("climate change");

  const query = useInfiniteQuery<
    WorksResponse<RawWork>,
    Error,
    RawWork[],
    ["works", string],
    number
  >({
    queryKey: ["works", search],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorksPage({ search, page: pageParam, perPage: 25 }),
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

  const items: RawWork[] = query.data ?? [];

  const parsedData = items.map((item) => workDataParser(item));

  return (
    <>
      <SearchBar searchQuery={search} setSearchQuery={setSearch} />
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

        {parsedData &&
          parsedData?.length > 0 &&
          parsedData.map((item, index) => (
            <PublicationItem key={`publish-item-${index}`} item={item} />
          ))}
      </section>
    </>
  );
}
