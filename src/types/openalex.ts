export type Author = {
  position: string;
  author: string;
};

export type Concept = {
  display_name: string;
  level: number;
  score: number;
};

export type Institution = {
  display_name: string;
  country_code?: string;
};

export type Publication = {
  id: string;
  title: string;
  authorships: Array<{
    author: Author;
    institutions: Institution[];
  }>;
  publication_date: string;
  institution: Institution[];
  concepts: Concept[];
  cited_by_count: number;
};
