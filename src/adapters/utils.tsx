import { z } from "zod";

export function take<T>(arr: T[] | undefined, n: number): T[] {
  return Array.isArray(arr) ? arr.slice(0, n) : [];
}

const AbstractInvIndex = z.record(
  z.string(),
  z.array(z.number().int().nonnegative())
);

export const RawWorkSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  publication_date: z.string(),
  authorships: z.array(
    z.object({
      author: z.object({ display_name: z.string() }),
      institutions: z.array(z.object({ display_name: z.string() || "" })),
    })
  ),
  concepts: z.array(z.object({ display_name: z.string() })),
  abstract_inverted_index: z.preprocess(
    (v) => (v === null ? undefined : v),
    AbstractInvIndex.optional()
  ),
});

export type RawWork = z.infer<typeof RawWorkSchema>;

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

  // Sort institutions by:
  //    a) frequency desc, then
  //    b) name alphabetically to make ties stable
  const unique = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([n]) => n);

  return unique;
}

type InvIndex = Record<string, number[]>;

export function reconstructAbstract(inv?: InvIndex): string | undefined {
  if (!inv) return undefined;

  const positions = Object.values(inv).flat();
  if (positions.length === 0) return undefined;

  const max = Math.max(...positions);
  const words = new Array<string>(max + 1).fill("");

  for (const [word, idxs] of Object.entries(inv)) {
    for (const i of idxs) words[i] = word;
  }

  const text = words
    .join(" ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return text;
}
