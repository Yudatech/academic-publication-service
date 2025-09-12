import { type RawWork } from "@/adapters/dataParser";
const BASE = "https://api.openalex.org";
const MAILTO = import.meta.env.VITE_OPENALEX_MAILTO;

export type GroupBucket = {
  key: string;
  key_display_name?: string;
  count: number;
};

export type WorksResponse<T> = {
  meta: { count: number; page: number; per_page: number };
  results: T[];
};

export function buildWorksUrl({
  search = "climate change",
  page = 1,
  perPage = 50,
}: {
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const u = new URL(`${BASE}/works`);
  u.searchParams.set("search", search);
  u.searchParams.set("per-page", String(perPage));
  u.searchParams.set("page", String(page));
  u.searchParams.set("mailto", MAILTO);
  return u.toString();
}

export async function fetchWorksPage(args: {
  search?: string;
  page?: number;
  perPage?: number;
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
