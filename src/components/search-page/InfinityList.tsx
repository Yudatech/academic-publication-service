import { useEffect, useMemo, useRef } from "react";
import PublicationItem from "@/components/search-page/PublicationItem";
import type { Publication } from "@/types/openalex";

export default function InfiniteList({
  items,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  fetchNextPage,
  onOpen,
}: {
  items: Publication[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  fetchNextPage: () => void;
  onOpen: (item: Publication) => void;
}) {
  const list = useMemo(() => items, [items]);

  // IntersectionObserver sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "800px 0px 800px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-3" aria-live="polite">
      {list.length === 0 && !isFetching && (
        <p className="text-sm text-neutral-600">No results.</p>
      )}

      {list.map((item, index) => (
        <PublicationItem
          key={item.id ?? `pub-${index}`}
          item={item}
          onOpen={() => onOpen(item)}
        />
      ))}

      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="py-6 text-center text-sm text-neutral-500"
        >
          {isFetchingNextPage ? "Loading more…" : "Scroll for more"}
        </div>
      )}
    </div>
  );
}
