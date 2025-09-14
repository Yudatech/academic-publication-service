export type FiltersDraft = {
  institutions: InstitutionsLite[];
  // add more later:
  // institutionIds: string[];
  // conceptIds: string[];
};

export type InstitutionsLite = { id: string; display_name: string };

export type Filters = Partial<FiltersDraft>;
export const initialFiltersDraft: FiltersDraft = { institutions: [] };
