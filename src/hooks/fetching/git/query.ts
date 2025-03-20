import { useQueries } from "@tanstack/react-query";
import { getGithubRepos, getGitlabRepos } from "./axios";

export function useGetRepo() {
  return useQueries({
    queries: [
      {
        queryKey: ["repo", "github"],
        queryFn: () => getGithubRepos(),
      },
      {
        queryKey: ["repo", "gitlab"],
        queryFn: () => getGitlabRepos(),
      },
    ],
  });
}
