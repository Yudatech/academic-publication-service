import { type RawWork } from "@/adapters/dataSchema";

const BASE = "https://api.openalex.org";
const MAILTO = import.meta.env.VITE_OPENALEX_MAILTO;
const commonFilters: string[] = [
  "institutions.country_code:DK",
  "from_publication_date:2025-01-01",
  "to_publication_date:2025-12-31",
];

export type GroupBucket = {
  key: string;
  key_display_name?: string;
  count: number;
};

export type WorksResponse<T> = {
  meta: { count: number; page: number; per_page: number };
  results: T[];
};

type WorksPageArgs = {
  page?: number;
  perPage?: number;
  search?: string;
  instituionIds?: string[];
};

function buildWorksUrl({
  search,
  page = 1,
  perPage = 25,
  instituionIds,
}: WorksPageArgs) {
  const u = new URL(`${BASE}/works`);
  if (search && search.trim() !== "") {
    u.searchParams.set("search", search.trim());
  }

  const filters =
    instituionIds && instituionIds.length > 0
      ? commonFilters.concat(`institutions.id:${instituionIds.join("|")}`)
      : commonFilters;
  const filterString = filters.join(",");

  u.searchParams.set("filter", filterString);
  u.searchParams.set("per-page", String(perPage));
  u.searchParams.set("page", String(page));
  u.searchParams.set("mailto", MAILTO);
  u.searchParams.set(
    "select",
    [
      "id",
      "display_name",
      "publication_date",
      "authorships",
      "concepts",
      "abstract_inverted_index",
      "open_access",
      "doi",
      "ids",
      "cited_by_count",
      "primary_location",
    ].join(",")
  );

  return u.toString();
}

export async function fetchWorksPage(args: {
  search?: string;
  page?: number;
  perPage?: number;
  instituionIds?: string[];
}): Promise<WorksResponse<RawWork>> {
  const url = buildWorksUrl(args);
  console.debug("[OpenAlex] GET", url);
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (e) {
    throw new Error(`Network error: ${(e as Error).message}\nURL: ${url}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status} ${res.statusText}\nURL: ${url}\nBody: ${body.slice(
        0,
        500
      )}`
    );
  }
  return res.json();
}

export async function fetchPublicationsPerInstitution({
  search = "climate change",
  top = 15,
}: {
  search?: string;
  top?: number;
}): Promise<GroupBucket[]> {
  const u = new URL(`${BASE}/works`);
  u.searchParams.set("search", search);
  u.searchParams.set("filter", commonFilters.join(","));
  u.searchParams.set("group_by", "authorships.institutions.id");
  u.searchParams.set("mailto", MAILTO);

  const res = await fetch(u.toString());
  if (!res.ok) throw new Error(`OpenAlex group_by failed: ${res.status}`);
  const data = await res.json();
  const buckets: GroupBucket[] = data.group_by ?? [];
  return buckets.sort((a, b) => b.count - a.count).slice(0, top);
}
