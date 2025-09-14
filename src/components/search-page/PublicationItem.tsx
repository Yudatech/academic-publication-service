import { memo, useMemo, KeyboardEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Building, Tag } from "lucide-react";
import type { Publication } from "@/types/openalex";

/**
 * PublicationItem
 *  - Presentational card for a single publication.
 *  - Click/Enter/Space triggers `onOpen` to show details/overlay.
 *  - Keeps render light by memoizing derived strings (authors, institutions).
 */
function PublicationItem({
  item,
  onOpen,
}: {
  item: Publication;
  onOpen: () => void;
}) {
  const title = item.title?.trim() || "Untitled";

  // Authors: map to names, show top N with "+N more"
  const { line: authorsLine, hasAuthors } = useMemo(() => {
    const names = (item.authors ?? [])
      .map((a) => a?.author)
      .filter(Boolean) as string[];
    const shown = names.slice(0, 5);
    const more = Math.max(names.length - shown.length, 0);
    return {
      line: shown.join(", ") + (more ? ` +${more} more` : ""),
      hasAuthors: names.length > 0,
    };
  }, [item.authors]);

  // Institutions: already transfered to string as display_name(country_code)
  const { line: institutionsLine, hasInstitutions } = useMemo(() => {
    const list = (item.institutions ?? []).filter(Boolean);
    const shown = list.slice(0, 5);
    const more = Math.max(list.length - shown.length, 0);
    return {
      line: shown.join(", ") + (more ? ` +${more} more` : ""),
      hasInstitutions: list.length > 0,
    };
  }, [item.institutions]);

  // Concepts: show first 6
  const topConcepts = useMemo(
    () => (item.concepts ?? []).slice(0, 6),
    [item.concepts]
  );

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <>
      <Card
        key={item.id}
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label={`Open details for ${title}`}
        onKeyDown={handleKey}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-foreground leading-tight flex-1">
                {title}
              </h3>
            </div>

            {/* Meta block */}
            <div className="bg-muted/50 p-6 rounded-lg">
              {/* Authors */}
              <MetaRow
                icon={
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                }
              >
                <span className="text-sm font-medium text-muted-foreground">
                  Authors:{" "}
                </span>
                <span className="text-sm">
                  {hasAuthors ? (
                    authorsLine
                  ) : (
                    <em className="text-muted-foreground/80">Unavailable</em>
                  )}
                </span>
              </MetaRow>

              {/* Institutions */}
              <MetaRow
                icon={
                  <Building className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                }
              >
                <span className="text-sm font-medium text-muted-foreground">
                  Institutions:{" "}
                </span>
                <span className="text-sm">
                  {hasInstitutions ? (
                    institutionsLine
                  ) : (
                    <em className="text-muted-foreground/80">Unavailable</em>
                  )}
                </span>
              </MetaRow>

              {/* Published date */}
              <MetaRow
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              >
                <span className="text-sm">
                  <span className="font-medium text-muted-foreground">
                    Published:{" "}
                  </span>
                  {item.publicationDate || (
                    <em className="text-muted-foreground/80">Unknown</em>
                  )}
                </span>
              </MetaRow>

              {/* Concepts */}
              {topConcepts.length > 0 && (
                <MetaRow
                  icon={
                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  }
                >
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    Research Topics:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {topConcepts.map((c, i) => (
                      <Badge
                        key={`${c.name}-${i}`}
                        variant="outline"
                        className="text-xs"
                      >
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                </MetaRow>
              )}
            </div>

            {/* Footer/Additional Info */}
            <div className="flex items-center justify-between pt-2 ">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {typeof item.citedByCount === "number" && (
                  <span>Citations: {item.citedByCount.toLocaleString()}</span>
                )}
                {item.openAccess?.isOA && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Open Access
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Click to view details
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

const MetaRow = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div className="flex-1">{children}</div>
    </div>
  );
};

/**
 * Memoize to avoid re-rendering unchanged cards.
 * Shallow compare by `item.id`; if your `Publication` may update in place,
 * expand the comparator to check other primitives as needed.
 */
export default memo(
  PublicationItem,
  (prev, next) => prev.item.id === next.item.id
);
