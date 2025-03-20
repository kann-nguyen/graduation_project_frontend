export interface RepoImport {
  name: string;
  url: string;
  status: "private" | "public";
  owner: string;
}
