import type { Publication } from "../types/openalex";
import { take } from "./utils";
import {
  type RawWork,
  summarizeInstitutions,
  reconstructAbstract,
} from "./utils";

export function workDataParser(raw: RawWork): Publication {
  const authors: string[] = (raw.authorships || []).map(
    (a) => a.author?.display_name || ""
  );

  return {
    id: raw.id,
    title: raw.display_name,
    authors: authors,
    institutions: summarizeInstitutions(raw),
    publicationDate: raw.publication_date,
    concepts: take(
      raw.concepts?.map((c) => c.display_name),
      5
    ),
    abstract: reconstructAbstract(raw.abstract_inverted_index) || "",
  };
}
