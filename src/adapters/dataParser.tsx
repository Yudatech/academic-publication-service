import type { Publication, Author } from "../types/openalex";
import {
  type RawWork,
  summarizeInstitutions, // de-duplicates + ranks institution names from authorships
  reconstructAbstract, // converts OpenAlex abstract_inverted_index -> human text
} from "./dataSchema";

/**
 * workDataParser
 * Converts an OpenAlex `RawWork` (API shape) into a UI-friendly `Publication`.
 * - Normalizes nullables to safe defaults for rendering
 * - Builds author display + affiliation strings
 * - Reconstructs abstract text from the inverted index
 * - Collapses OA flags (open_access + primary_location) into a single boolean
 */
export function workDataParser(raw: RawWork): Publication {
  // --- Authors & affiliations ---------------------------------------------
  const authors: Author[] = (raw.authorships || []).map((a) => {
    return {
      author: a.author?.display_name || "",
      institutions: a.institutions?.map(
        (i) => `${i.display_name} (${i.country_code})` || ""
      ),
    };
  });

  // --- Open Access (OA) ----------------------------------------------------
  const isOA = raw.open_access?.is_oa || raw.primary_location?.is_oa || false;

  // --- Institutions
  const institutions = summarizeInstitutions(raw);

  // --- Concepts ------------------------------------------------------------
  // Map to simple { name, score } objects; default score to 0 when missing
  const concepts =
    raw.concepts?.map((c) => ({
      name: c.display_name,
      score: c.score ?? 0,
    })) ?? [];

  // --- Abstract ------------------------------------------------------------
  // Reconstruct the plain-text abstract from the inverted index (if present)
  const abstractText = reconstructAbstract(raw.abstract_inverted_index) ?? "";

  return {
    id: raw.id,
    title: raw.display_name,
    type: raw.type,
    authors: authors,
    institutions: institutions,
    publicationDate: raw.publication_date,
    concepts: concepts,
    abstract: abstractText,
    openAccess: {
      isOA: isOA,
      oaStatus: raw.open_access?.oa_status,
      oaUrl: raw.open_access?.oa_url,
    },
    ids: {
      doi: raw.ids?.doi,
      openalex: raw.ids?.openalex,
    },
    citedByCount: raw.cited_by_count,
    primaryLocation: {
      isOA: isOA,
      landingPageUrl: raw.primary_location?.landing_page_url,
      pdfUrl: raw.primary_location?.pdf_url,
      sourceName: raw.primary_location?.source?.display_name,
      hostOrgName: raw.primary_location?.source?.host_organization_name,
    },
  };
}
