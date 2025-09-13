import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import InfiniteList from "@/components/InfinityList";
import { BarChart3 } from "lucide-react";

const MIN_LEN = 2;

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const enabled = Boolean(searchQuery && searchQuery.trim().length >= MIN_LEN);

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2 items-center  justify-center">
          Research Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Overview of your research activity and publication insights
        </p>
      </div>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <InfiniteList searchQuery={searchQuery} enabled={enabled} />
    </>
  );
}
