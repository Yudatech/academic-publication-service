import { useMemo } from "react";
import type { Publication } from "@/types/openalex";
import { Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  /** Publication to render authors from */
  item: Publication;
  /** Whether we show the full author list (otherwise only first 3) */
  authorsExpanded: boolean;
  /** Parent-owned setter to toggle expansion */
  setAuthorsExpanded: (status: boolean) => void;
};

/**
 * AuthorList
 * Renders "Authors & Affiliations" with an expandable list.
 * - Shows the first 3 authors by default, with a "Show all" toggle if more exist.
 * - Displays affiliations (institutions) per author when available.
 * - Adds accessible expand/collapse semantics.
 */

export function AuthorList({
  item,
  authorsExpanded,
  setAuthorsExpanded,
}: Props) {
  const authors = item.authors ?? [];
  if (authors.length === 0) return null;

  // Derive the list slice and hidden count once per change
  const { visibleAuthors, hiddenCount } = useMemo(() => {
    const total = authors.length;
    const limit = authorsExpanded ? total : 3;
    return {
      visibleAuthors: authors.slice(0, limit),
      hiddenCount: Math.max(total - 3, 0),
    };
  }, [authors, authorsExpanded]);

  return (
    <section aria-labelledby="authors-heading">
      <h4
        id="authors-heading"
        className="font-semibold mb-3 flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        Authors & Affiliations
      </h4>

      {/* Author list */}
      <div
        id={`${item.title}-author`}
        className="space-y-3 bg-muted/50 p-4 rounded-lg"
        // Screen readers: content changes when expanding, but do it politely
        aria-live="polite"
      >
        {visibleAuthors.map((auth, idx) => {
          const key = `${auth.author ?? "unknown"}-${idx}`;
          const name = auth.author?.trim() || "Unknown author";
          const insts = (auth.institutions ?? []).filter(Boolean);
          return (
            <div key={key} className="border-l-2 border-muted pl-4">
              <div className="font-medium text-sm">{name}</div>
              {insts.length > 0 ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  {insts.join(", ")}
                </div>
              ) : (
                <div className="mt-1 text-xs text-muted-foreground/70">
                  No affiliations listed
                </div>
              )}
            </div>
          );
        })}

        {/* Expand / collapse control */}
        {hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAuthorsExpanded(!authorsExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground"
            aria-label={
              authorsExpanded
                ? "Collapse author list"
                : "Expand to show all authors"
            }
            aria-expanded={authorsExpanded}
            aria-controls={`${item.title}-author`}
          >
            {authorsExpanded
              ? `Show less (${authors.length - 3} authors hidden)`
              : `Show all ${authors.length} authors`}
            <ChevronDown
              className={`h-3 w-3 ml-1 transition-transform ${
                authorsExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        )}
      </div>
    </section>
  );
}
