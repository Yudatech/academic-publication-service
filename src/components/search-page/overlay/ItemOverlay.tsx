import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Publication } from "@/types/openalex";
import { Tag, ExternalLink, BookOpen, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/adapters/utils";
import { AuthorList } from "./AuthorList";

type Props = {
  /** Whether the overlay is open (controlled by parent) */
  open: boolean;
  /** Parent-controlled setter for dialog open state */
  setDialogOpen: (status: boolean) => void;
  /** The selected publication to display */
  item?: Publication | null;
};

/**
 * ItemOverlay
 * - Controlled dialog showing detailed information for a single publication.
 * - Renders nothing when there's no `item`.
 */

export default function ItemOverlay({ open, setDialogOpen, item }: Props) {
  const [authorsExpanded, setAuthorsExpanded] = useState(false);
  // Early return keeps DOM clean when no item is selected
  if (!item) return null;

  // Convenience
  const hasAnyAccessLink =
    Boolean(item.ids?.doi) ||
    Boolean(item.ids?.openalex) ||
    Boolean(item.primaryLocation?.pdfUrl);

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto" // Announce updates politely for screen readers
        aria-live="polite"
      >
        <DialogHeader className="border-b">
          <DialogTitle className="text-xl font-bold leading-tight pr-8 py-6">
            {item.title || "Publication Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {/* Abstract ------------------------------------------------------ */}
          {item.abstract && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 ">
                <BookOpen className="h-4 w-4" />
                Abstract
              </h4>
              <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                {item.abstract}
              </p>
            </div>
          )}

          {/* Publication Info Grid ---------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4">
            {/* Citation Count */}
            <div>
              <h4 className="font-semibold mb-2">Citation Count</h4>
              <p className="text-2xl font-bold text-primary">
                {item.citedByCount?.toLocaleString() || "0"}
              </p>
            </div>

            {/* Publication Details */}
            <div>
              <h4 className="font-semibold mb-2">Publication Details</h4>
              <div className="space-y-1 text-sm">
                {item.publicationDate && (
                  <div>
                    <span className="font-medium">Date: </span>
                    {formatDate(item.publicationDate)}
                  </div>
                )}
                {item.type && (
                  <div>
                    <span className="font-medium">Type: </span>
                    {item.type.replace("-", " ")}
                  </div>
                )}
                {item.primaryLocation.hostOrgName && (
                  <div>
                    <span className="font-medium">Host Orgnization: </span>
                    {item.primaryLocation.hostOrgName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Author List with Affiliations ---------------------------- */}
          <AuthorList
            item={item}
            authorsExpanded={authorsExpanded}
            setAuthorsExpanded={setAuthorsExpanded}
          />

          {/* Concepts + Access --------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {item.concepts && item.concepts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Research Concepts
                </h4>
                <div className="space-y-2 p-4">
                  {item.concepts
                    .sort((a, b) => b?.score - a?.score)
                    .slice(0, 10)
                    .map((concept, index) => (
                      <div
                        key={concept.name}
                        className="flex items-center justify-between"
                      >
                        <Badge variant="outline" className="text-xs">
                          {concept.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((concept.score ?? 0) * 100)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Access / Links */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Access Information
              </h4>
              <div className="space-y-4">
                {/* OA badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={item.openAccess?.isOA ? "outline" : "secondary"}
                    className={
                      item.openAccess?.isOA
                        ? "text-green-600 border-green-600"
                        : ""
                    }
                  >
                    {item.openAccess?.isOA
                      ? "Open Access"
                      : "Restricted Access"}
                  </Badge>
                </div>

                {/* External links (render only if any exist) */}
                {hasAnyAccessLink && (
                  <div className="flex flex-wrap gap-3">
                    {item.ids.doi && (
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="Open DOI"
                        asChild
                      >
                        <a
                          href={item.ids.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          DOI
                        </a>
                      </Button>
                    )}
                    {item.ids?.openalex && (
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="Open OpenAlex"
                        asChild
                      >
                        <a
                          href={item.ids?.openalex}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          OpenAlex
                        </a>
                      </Button>
                    )}
                    {item.primaryLocation?.pdfUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={item.primaryLocation?.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open PDF"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          PDF
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
