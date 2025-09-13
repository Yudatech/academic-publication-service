import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Publication } from "@/types/openalex";
import { Tag, ExternalLink, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/adapters/utils";
import { AuthorList } from "./AuthorList";

type Props = {
  open: boolean;
  setDialogOpen: (status: boolean) => void;
  item?: Publication | null;
};

export default function ItemOverlay({ open, setDialogOpen, item }: Props) {
  const [authorsExpanded, setAuthorsExpanded] = useState(false);
  if (!item) return null;
  return (
    <Dialog open={open} onOpenChange={() => setDialogOpen(false)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b">
          <DialogTitle className="text-xl font-bold leading-tight pr-8 py-4">
            {item.title || "Publication Details"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
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

          {/* Publication Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Citation Count */}
            <div className="mx-4">
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

          {/* Full Author List with Affiliations */}
          <AuthorList
            item={item}
            authorsExpanded={authorsExpanded}
            setAuthorsExpanded={setAuthorsExpanded}
          />

          {/* Concepts */}
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
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <Badge variant="outline" className="text-xs">
                          {concept.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(concept.score * 100)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3">Access Information</h4>
              <div className="space-y-2">
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
                <div className="flex flex-wrap gap-3">
                  {item.ids.doi && (
                    <Button variant="outline" size="sm" asChild>
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
                    <Button variant="outline" size="sm" asChild>
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
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Access Info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {item.citedByCount !== undefined && (
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
