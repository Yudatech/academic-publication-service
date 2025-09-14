import { type Publication } from "@/types/openalex";
import { Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthorList({
  item,
  authorsExpanded,
  setAuthorsExpanded,
}: {
  item: Publication;
  authorsExpanded: boolean;
  setAuthorsExpanded: (status: boolean) => void;
}) {
  return (
    <>
      {item.authors && item.authors.length > 0 && (
        <div className="">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Authors & Affiliations
          </h4>
          <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
            {item.authors
              .slice(0, authorsExpanded ? undefined : 3)
              .map((authorship, index) => (
                <div key={index} className="border-l-2 border-muted pl-4">
                  <div className="font-medium text-sm">{authorship.author}</div>
                  {authorship.institutions.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {authorship.institutions.map((inst, instIndex) => (
                        <span key={instIndex}>
                          {inst}
                          {instIndex < authorship.institutions.length - 1 &&
                            ", "}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {item.authors.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAuthorsExpanded(!authorsExpanded)}
                className="text-xs text-muted-foreground hover:text-foreground"
                aria-label="expand to show all authors"
              >
                {authorsExpanded
                  ? `Show less (${item.authors.length - 3} authors hidden)`
                  : `Show all ${item.authors.length} authors`}
                <ChevronDown
                  className={`h-3 w-3 ml-1 transition-transform ${
                    authorsExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
