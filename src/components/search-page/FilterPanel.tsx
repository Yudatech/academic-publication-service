import { useEffect, useMemo, useState, useId } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { findInstitutions } from "@/api/getFilterIds";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FiltersDraft, InstitutionsLite } from "@/types/filters";

type Props = {
  /** Controlled filters (draft state) coming from the parent */
  value: FiltersDraft;
  /** Update the draft filters in the parent */
  onChange: (next: FiltersDraft) => void;
  /** Commit the current draft filters (the parent decides what “apply” means) */
  onApply: () => void;
  /** Clear all filters (parent + reset local UI) */
  onClear: () => void;
  /** Disable the whole panel (e.g., until a search is committed) */
  disabled?: boolean;
};

const MIN_LEN = 2;

export default function FilterPanel({
  value,
  onChange,
  onApply,
  onClear,
  disabled,
}: Props) {
  // --- Local input state for the institution query (draft text) ----------
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce to reduce API chatter while typing
  useEffect(() => {
    const t = setTimeout(() => setDebounced(institutionQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [institutionQuery]);

  const canSuggest = debounced.length >= MIN_LEN && !disabled;

  // --- Fetch institution suggestions -------------------------------------
  const suggest = useQuery<InstitutionsLite[]>({
    queryKey: ["institution-suggest", debounced],
    queryFn: () => findInstitutions(debounced),
    enabled: canSuggest,
    staleTime: 60_000,
    placeholderData: keepPreviousData, // keep old list while fetching new input
  });

  // Build a fast lookup for already-selected IDs to filter suggestions
  const selectedIds = useMemo(
    () => new Set(value.institutions.map((i) => i.id)),
    [value.institutions]
  );

  // Filter out items we’ve already selected
  const suggestions = useMemo(
    () => (suggest.data ?? []).filter((i: any) => !selectedIds.has(i.id)),
    [suggest.data, selectedIds]
  );

  // Add an institution (id + display name) to the draft
  const addInstitution = (i: InstitutionsLite) => {
    if (!value.institutions.some((sel) => sel.id === i.id)) {
      onChange({ ...value, institutions: [...value.institutions, i] });
    }
    setInstitutionQuery("");
  };

  // Remove by ID
  const removeInstitution = (id: string) => {
    onChange({
      ...value,
      institutions: value.institutions.filter((i) => i.id !== id),
    });
  };

  // Small helper to display short IDs (OpenAlex style)
  function shortId(id: string) {
    const m = id.match(/\/([A-Z]\d+)$/);
    return m ? m[1] : id;
  }

  return (
    <Card className="mb-4">
      <CardContent className="space-y-3 p-4">
        {/* Input + actions row */}
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label
              htmlFor="institution-filter"
              className="block text-sm font-medium mb-2"
            >
              Filter by institution
            </Label>
            <div className="relative">
              <Input
                id="institution-filter"
                type="search"
                placeholder="Type institution name (min 2 chars)…"
                value={institutionQuery}
                onChange={(e) => setInstitutionQuery(e.target.value)}
                disabled={disabled}
                aria-autocomplete="list"
                aria-controls="listbox"
                aria-expanded={
                  canSuggest && (suggest.isFetching || suggestions.length > 0)
                }
                aria-describedby={
                  disabled ? `insititute-filter-help` : undefined
                }
              />
              {/* Suggestion list */}
              {canSuggest && (suggest.isFetching || suggestions.length > 0) && (
                <div
                  id="listbox"
                  role="listbox"
                  className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow"
                >
                  {suggest.isFetching && (
                    <div className="px-3 py-2 text-sm text-neutral-500">
                      Searching…
                    </div>
                  )}
                  {!suggest.isFetching && suggestions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-neutral-500">
                      No matches
                    </div>
                  )}
                  {suggestions.map((i: any) => (
                    <button
                      type="button"
                      role="option"
                      key={i.display_name}
                      onClick={() => addInstitution(i)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                      aria-label={`Select ${i.display_name}`}
                    >
                      <span className="font-medium">{i.display_name}</span>{" "}
                      <span className="text-neutral-500">
                        ({shortId(i.id)})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Apply / Clear actions */}
          <Button
            onClick={onApply}
            disabled={disabled}
            className="bg-black text-white hover:bg-black/90"
            aria-disabled={disabled}
            aria-controls="results-region"
            aria-label="apply fiters"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onClear();
              setInstitutionQuery("");
            }}
            disabled={disabled}
            aria-label="clear all filters"
            aria-disabled={disabled}
            aria-controls="results-region"
          >
            Clear
          </Button>
        </div>

        {/* Selected institution chips */}
        <div className="flex flex-wrap gap-2">
          {value.institutions.map((i) => (
            <span
              key={i.display_name}
              className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs"
              title={i.display_name}
            >
              <span className="font-medium">{i.display_name}</span>
              <button
                onClick={() => removeInstitution(i.id)}
                className="text-neutral-500"
                aria-label="Remove selected filter"
              >
                ×
              </button>
            </span>
          ))}
          {value.institutions.length === 0 && (
            <span className="text-xs text-neutral-500">
              No institution selected
            </span>
          )}
        </div>

        {disabled && (
          <p className="text-xs text-neutral-500">
            Tip: Run a search first. Then refine with filters here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
