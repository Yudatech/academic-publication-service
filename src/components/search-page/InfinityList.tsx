import { useEffect, useMemo, useRef, memo } from "react";
import PublicationItem from "@/components/search-page/PublicationItem";
import type { Publication } from "@/types/openalex";

type Props = {
  /** Flattened list of results to render */
  items: Publication[];
  /** Whether there are more pages available */
  hasNextPage: boolean;
  /** True only while the NEXT page is being fetched */
  isFetchingNextPage: boolean;
  /** Any fetch in progress (initial/background/next) */
  isFetching: boolean;
  /** Trigger loading the next page (from useInfiniteQuery) */
  fetchNextPage: () => void;
  /** Open overlay/details for an item */
  onOpen: (item: Publication) => void;
};

/**
 * Renders a list of publication cards with infinite scroll.
 * - "Dumb" component: no data fetching; just calls `fetchNextPage` when sentinel enters view.
 * - Provides an accessible "Load more" fallback button.
 */

function InfiniteList({
  items,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  fetchNextPage,
  onOpen,
}: Props) {
  // Memoize the list reference so re-renders don't rebuild arrays unnecessarily
  const list = useMemo(() => items, [items]);

  // IntersectionObserver sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If there's nothing to load, don't attach an observer
    if (!hasNextPage) return;

    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Only fetch when:
        // - sentinel is visible
        // - more pages exist
        // - we're not already fetching the next page
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      // Generous rootMargin preloads before the user reaches the end
      { root: null, rootMargin: "800px 0px", threshold: 0.01 }
    );

    io.observe(el);
    return () => {
      io.unobserve(el);
      io.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      className="space-y-3"
      aria-live="polite"
      aria-busy={isFetchingNextPage ? "true" : "false"}
    >
      {/* Empty state (only when not fetching) */}
      {list.length === 0 && !isFetching && (
        <p className="text-sm text-neutral-600">No results.</p>
      )}

      {/* Items */}
      {list.map((item, index) => (
        <PublicationItem
          key={item.id ?? `pub-${index}`}
          item={item}
          onOpen={() => onOpen(item)}
        />
      ))}

      {/* Infinite scroll sentinel + status */}
      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="py-6 text-center text-sm text-neutral-500"
        >
          {isFetchingNextPage ? "Loading more…" : "Scroll for more"}
        </div>
      )}

      {/* Accessible fallback: works if IntersectionObserver is unavailable or blocked */}
      {hasNextPage && (
        <div className="text-center">
          <button
            type="button"
            className="rounded border px-3 py-2 text-sm"
            onClick={fetchNextPage}
            disabled={isFetchingNextPage}
            aria-label="Load more results"
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(InfiniteList);
