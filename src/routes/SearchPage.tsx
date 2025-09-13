import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import InfiniteList from "@/components/search-page/InfinityList";

const MIN_LEN = 2;

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [enabled, setEnabled] = useState(false);

  function startSearch(q?: string) {
    const v = (q ?? searchQuery).trim();
    const ok = v.length >= MIN_LEN;
    setActiveQuery(ok ? v : "");
    setEnabled(ok);
  }

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
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={startSearch}
      />
      <InfiniteList searchQuery={activeQuery} enabled={enabled} />
    </>
  );
}
