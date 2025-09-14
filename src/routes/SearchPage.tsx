import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import InfiniteList from "@/components/search-page/InfinityList";
import ItemOverlay from "@/components/search-page/overlay/ItemOverlay";
import { fetchWorksPage, type WorksResponse } from "@/api/openalex";
import { type RawWork, RawWorkSchema } from "@/adapters/dataSchema";
import { workDataParser } from "@/adapters/dataParser";
import type { Publication } from "@/types/openalex";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingCard } from "@/components/LoadingCard";

const MIN_LEN = 2;

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState<string>("");
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState<Publication | null>(null);

  function startSearch(q?: string) {
    const search = (q ?? searchQuery).trim();
    const approved = search.length >= MIN_LEN;
    setActiveQuery(approved ? search : "");
    setEnabled(approved);
  }

  const query = useInfiniteQuery<WorksResponse<RawWork>, Error>({
    queryKey: ["works", activeQuery],
    queryFn: () =>
      fetchWorksPage({ search: activeQuery, page: 1, perPage: 25 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, per_page, count } = last.meta;
      const maxPage = Math.ceil(count / per_page);
      return page < maxPage ? page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });

  // Flatten + validate (skip bad rows safely)
  const rawItems: RawWork[] = useMemo(() => {
    if (!query.data) return [];
    const pages = query.data.pages ?? [];
    return pages
      .flatMap((p) => p.results)
      .map((r) => RawWorkSchema.safeParse(r))
      .flatMap((res) => (res.success ? [res.data] : []));
  }, [query.data]);

  // Adapt to your UI’s Publication type
  const items: Publication[] = useMemo(
    () => rawItems.map((rw) => workDataParser(rw)),
    [rawItems]
  );

  return (
    <div className="space-y-6">
      <div className="mb-10 text-center mb-6">
        <h1 className="mb-2 items-center justify-center text-4xl font-bold text-foreground">
          Academic Publication Search
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover research publications from OpenAlex database
        </p>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={startSearch}
      />

      {!enabled && (
        <p className="text-sm text-neutral-600">
          Enter at least {MIN_LEN} characters to search.
        </p>
      )}

      {enabled && query.status === "pending" && <LoadingCard />}

      {enabled && query.status === "error" && (
        <Alert variant="destructive" className="max-w-xl">
          <AlertCircleIcon />
          <AlertTitle>Failed to load publications</AlertTitle>
          <AlertDescription>
            <p>{query.error?.message ?? "Please try again."}</p>
          </AlertDescription>
        </Alert>
      )}

      {enabled && query.status === "success" && (
        <>
          <InfiniteList
            items={items}
            hasNextPage={!!query.hasNextPage}
            isFetchingNextPage={!!query.isFetchingNextPage}
            isFetching={!!query.isFetching}
            fetchNextPage={() => query.fetchNextPage()}
            onOpen={(pub) => setSelected(pub)}
          />

          <ItemOverlay
            open={!!selected}
            setDialogOpen={() => setSelected(null)}
            item={selected}
          />
        </>
      )}
    </div>
  );
}
