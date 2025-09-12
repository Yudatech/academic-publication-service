import { Card, CardContent } from "@/components/ui/card";
import { Publication } from "@/types/openalex";
import { Calendar, Users, Building, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PublicationItem({ item }: { item: Publication }) {
  return (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title and Type */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-semibold text-foreground leading-tight flex-1">
              {item.title || "Untitled"}
            </h3>
          </div>

          {/* Authors */}

          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium text-muted-foreground">
                Authors:{" "}
              </span>
              <span className="text-sm">
                {item.authors
                  .slice(0, 5)
                  .map((author) => author)
                  .join(", ")}
                {(item.authors.length > 5 &&
                  ` +${item.authors.length - 5} more`) ||
                  ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium text-muted-foreground">
                Published:{" "}
              </span>
              {item.publicationDate || ""}
            </span>
          </div>

          {item.institutions && (
            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Institutions:{" "}
                </span>
                <span className="text-sm">
                  {item.institutions
                    .slice(0, 5)
                    .map((ins) => ins)
                    .join(", ")}
                  {(item.institutions.length > 5 &&
                    ` +${item.institutions.length - 5} more`) ||
                    ""}
                </span>
              </div>
            </div>
          )}

          {item.concepts && item.concepts.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium text-muted-foreground mb-2 block">
                  Research Topics:
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.concepts.slice(0, 6).map((concept, index) => (
                    <Badge
                      key={`${concept}-${index}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
