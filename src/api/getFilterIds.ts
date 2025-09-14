export async function findInstitutions(q: string) {
  const u = new URL("https://api.openalex.org/institutions");
  u.searchParams.set("search", q);
  u.searchParams.set("per-page", "5");
  u.searchParams.set("select", "id,display_name");
  return (await fetch(u).then((r) => r.json())).results as {
    id: string;
    display_name: string;
  }[];
}

//export async function findAuthors...
