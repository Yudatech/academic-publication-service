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
            {/* {item.type && (
              <Badge variant="secondary" className="shrink-0">
                {item.type.replace("-", " ")}
              </Badge>
            )} */}
          </div>

          {/* Authors */}
          {item.authorships && item.authorships.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Authors:{" "}
                </span>
                <span className="text-sm">
                  {item.authorships
                    .slice(0, 5)
                    .map((authorship) => authorship.author)
                    .join(", ")}
                  {item.authorships.length > 5 &&
                    ` +${item.authorships.length - 5} more`}
                </span>
              </div>
            </div>
          )}

          {item.publication_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium text-muted-foreground">
                  Published:{" "}
                </span>
                {item.publication_date}
              </span>
            </div>
          )}

          {item.authorships && (
            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Institutions:{" "}
                </span>
                <span className="text-sm"></span>
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
                  {item.concepts
                    .filter((concept) => concept.score > 0.3)
                    .slice(0, 6)
                    .map((concept, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {concept.display_name}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {item.cited_by_count !== undefined && (
                <span>Citations: {item.cited_by_count.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
