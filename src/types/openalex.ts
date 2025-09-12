// export type Author = {
//   position: string;
//   author: string;
// };

// export type Concept = {
//   display_name: string;
//   level: number;
//   score: number;
// };

// export type Institution = {
//   display_name: string;
//   country_code?: string;
// };

// export type Author = {
//   author: string;
//   institutions: string[];
// };

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  institutions: string[];
  publicationDate: string;
  concepts: string[];
};
