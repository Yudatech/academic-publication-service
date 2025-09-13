import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
}: {
  searchQuery: string;
  setSearchQuery: (search: string) => void;
  onSearch: (search?: string) => void;
}) {
  const [q, setQ] = useState(searchQuery);
  useEffect(() => setQ(searchQuery), [searchQuery]);
  const canSearch = q.trim().length >= 2;

  function submit() {
    if (canSearch) onSearch(q);
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium mb-2">
              Search Publications
            </label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
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
              <Button
                onClick={submit}
                disabled={!canSearch}
                className="bg-black text-white hover:bg-black/90 text-primary-foreground"
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
