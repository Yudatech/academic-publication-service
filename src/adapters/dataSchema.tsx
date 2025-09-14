import { z } from "zod";

/**
 * OpenAlex represents abstracts as an "inverted index":
 *   { word: [positions...] }
 * Set the model as: Record<string, number[]>
 */
const AbstractInvIndex = z.record(
  z.string(),
  z.array(z.number().int().nonnegative())
);

/** Minimal "source" fields we actually render in the UI */
const PrimarySourceSchema = z.object({
  display_name: z.string().nullish(),
  host_organization_name: z.string().nullish(),
});

/** Primary location of the work (landing page, PDF, etc.) */
const PrimaryLocationSchema = z
  .object({
    is_oa: z.boolean().nullish(),
    landing_page_url: z.string().url().nullish(),
    pdf_url: z.string().url().nullish(),
    source: PrimarySourceSchema.nullish(),
  })
  .nullish();

/**
 * RawWorkSchema
 * A lean subset of OpenAlex "work" fields used by the app.
 * We mark many fields `nullish()` because OpenAlex frequently returns `null`.
 */
export const RawWorkSchema = z.object({
  id: z.string(),
  display_name: z.string().nullish(),
  type: z.string().nullish(),
  publication_date: z.string().nullish(),
  /** Authorship info with nested institutions; all nullable-friendly */
  authorships: z
    .array(
      z.object({
        author: z.object({ display_name: z.string() }),
        institutions: z.array(
          z.object({
            display_name: z.string().nullish() || "",
            country_code: z.string().nullish() || "",
          })
        ),
      })
    )
    .nullish(),
  /** High-level topical tags with optional scores */
  concepts: z
    .array(z.object({ display_name: z.string(), score: z.number().nullish() }))
    .nullish(),
  /**
   * Abstract inverted index:
   */
  abstract_inverted_index: z
    .preprocess((v) => (v === null ? "" : v), AbstractInvIndex.optional())
    .nullish(),
  /** Open access snapshot */
  open_access: z
    .object({
      is_oa: z.boolean().nullish(),
      oa_status: z.string().nullish(),
      oa_url: z.string().url().nullish(),
    })
    .nullish(),
  /** DOI string */
  odi: z.string().nullish(),
  /** Canonical IDs  */
  ids: z.object({
    openalex: z.string().nullish(),
    doi: z.string().nullish(),
  }),
  /** Citation count (default to 0 if missing) */
  cited_by_count: z.preprocess((v) => v ?? 0, z.number().int().nonnegative()),
  /** Primary location / venue info */
  primary_location: PrimaryLocationSchema,
});

export type RawWork = z.infer<typeof RawWorkSchema>;

/**
 * summarizeInstitutions
 * Collects institution names across all authorships and returns a
 * de-duplicated list sorted by:
 *   1) frequency (descending), then
 *   2) name (alphabetical) to make ties deterministic.
 */
export function summarizeInstitutions(work: RawWork) {
  const names: string[] = [];
  for (const a of work.authorships ?? []) {
    for (const i of a.institutions ?? []) {
      if (i?.display_name) names.push(i.display_name);
    }
  }
  if (names.length === 0) return [];

  const freq = new Map<string, number>();
  for (const n of names) freq.set(n, (freq.get(n) ?? 0) + 1);

  const unique = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([n]) => n);

  return unique;
}

/** Convenience TypeScript type for the abstract inverted index */
type InvIndex = Record<string, number[]>;

/**
 * reconstructAbstract
 * Converts an OpenAlex abstract "inverted index" into human-readable text.
 *
 * Example input:
 *   { climate: [0], change: [1, 10], is: [2], ... }
 * We place each word in its indexed position, join, and clean spacing/punctuation.
 */
export function reconstructAbstract(inv?: InvIndex | null): string | undefined {
  if (!inv) return undefined;

  // Gather all positions to find the length of the abstract
  const positions = Object.values(inv).flat();
  if (positions.length === 0) return undefined;

  const max = Math.max(...positions);
  const words = new Array<string>(max + 1).fill("");

  // Place each word at all of its character positions
  for (const [word, idxs] of Object.entries(inv)) {
    for (const i of idxs) words[i] = word;
  }

  // Join & tidy whitespace around punctuation
  const text = words
    .join(" ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return text;
}
