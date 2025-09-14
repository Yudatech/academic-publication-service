import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { findInstitutions } from "@/api/getFilterIds";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FiltersDraft, InstitutionsLite } from "@/types/filters";

type Props = {
  value: FiltersDraft;
  onChange: (next: FiltersDraft) => void;
  onApply: () => void;
  onClear: () => void;
  disabled?: boolean;
};

export default function FilterPanel({
  value,
  onChange,
  onApply,
  onClear,
  disabled,
}: Props) {
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(institutionQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [institutionQuery]);

  const suggest = useQuery({
    queryKey: ["institution-suggest", debounced],
    queryFn: () => findInstitutions(debounced),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  const selectedIds = useMemo(
    () => new Set(value.institutions.map((i) => i.id)),
    [value.institutions]
  );
  console.log("values", value);
  const suggestions = useMemo(
    () => (suggest.data ?? []).filter((i: any) => !selectedIds.has(i.id)),
    [suggest.data, selectedIds]
  );

  const addInstitution = (i: InstitutionsLite) => {
    if (!value.institutions.some((sel) => sel.id === i.id)) {
      onChange({ ...value, institutions: [...value.institutions, i] });
    }
    setInstitutionQuery("");
  };

  const removeInstitution = (id: string) => {
    onChange({
      ...value,
      institutions: value.institutions.filter((i) => i.id !== id),
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="institution">Filter by institution</Label>
            <div className="relative">
              <Input
                type="search"
                placeholder="Type institution name (min 2 chars)…"
                value={institutionQuery}
                onChange={(e) => setInstitutionQuery(e.target.value)}
                disabled={disabled}
              />
              {debounced.length >= 2 && !disabled && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow">
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
                      key={i.display_name}
                      onClick={() => addInstitution(i)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                      aria-label="select suggestion"
                    >
                      {i.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

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
