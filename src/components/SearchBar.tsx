import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

type Props = {
  /** Controlled search value from parent */
  searchQuery: string;
  /** Update the parent’s controlled value (fires on every keystroke) */
  setSearchQuery: (search: string) => void;
  /** Commit the current query (parent decides what to do, e.g., trigger fetch) */
  onSearch: (search?: string) => void;
};

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
}: Props) {
  // Local draft so we can manage UX without fighting the parent (still fully controlled via sync below)
  const [q, setQ] = useState(searchQuery);
  // Keep local in sync if parent resets/changes externally
  useEffect(() => setQ(searchQuery), [searchQuery]);
  // Derived UI flags
  const canSearch = q.trim().length >= 2;

  // Submit handler: prevent default, only commit when valid
  function submit() {
    if (canSearch) onSearch(q);
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="search" className="block text-sm font-medium mb-2">
              Search Publications
            </Label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="search"
                    id="search"
                    className="pl-10"
                    value={searchQuery}
                    placeholder="Search (min 2 chars)…"
                    onChange={(e) => {
                      setQ(e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                </div>
              </div>
              {/* Actions */}
              <Button
                onClick={submit}
                disabled={!canSearch}
                className="bg-black text-white hover:bg-black/90 text-primary-foreground"
                aria-label="apply search query"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
