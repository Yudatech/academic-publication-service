type OpenAccess = {
  isOA: boolean;
  oaStatus?: string | null;
  oaUrl?: string | null;
};

type Ids = {
  doi?: string | null;
  openalex?: string | null;
};

type PrimaryLocation = {
  isOA: boolean;
  landingPageUrl?: string | null;
  pdfUrl?: string | null;
  sourceName?: string | null;
  hostOrgName?: string | null;
};

type Concept = {
  name?: string | null;
  score: number;
};

export type Author = {
  author: string;
  institutions: string[];
};

export type Publication = {
  id: string;
  title?: string | null;
  type?: string | null;
  authors: Author[] | null;
  institutions: string[];
  publicationDate?: string | null;
  concepts?: Concept[];
  abstract: string;
  openAccess: OpenAccess;
  ids: Ids;
  citedByCount: number;
  primaryLocation: PrimaryLocation;
};
