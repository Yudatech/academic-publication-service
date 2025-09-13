import type { Publication, Author } from "../types/openalex";
import {
  type RawWork,
  summarizeInstitutions,
  reconstructAbstract,
} from "./dataSchema";

export function workDataParser(raw: RawWork): Publication {
  const authors: Author[] = (raw.authorships || []).map((a) => {
    return {
      author: a.author?.display_name || "",
      institutions: a.institutions?.map(
        (i) => `${i.display_name} (${i.country_code})` || ""
      ),
    };
  });

  const isOA = raw.open_access?.is_oa || raw.primary_location?.is_oa || false;

  return {
    id: raw.id,
    title: raw.display_name,
    type: raw.type,
    authors: authors,
    institutions: summarizeInstitutions(raw),
    publicationDate: raw.publication_date,
    concepts: raw.concepts?.map((concept) => {
      return { name: concept.display_name, score: concept.score || 0 };
    }),
    abstract: reconstructAbstract(raw.abstract_inverted_index) || "",
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
