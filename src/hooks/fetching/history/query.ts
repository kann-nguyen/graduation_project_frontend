import { useQuery } from "@tanstack/react-query";
import { getHistoryByProject } from "~/hooks/fetching/history/axios";
import { useAccountContext } from "~/hooks/general";

export function useActivityHistoryQuery(projectName: string) {
  return useQuery(["activityHistory", projectName], () =>
    getHistoryByProject(projectName, undefined)
  );
}
export function useActivityHistoryOfUserQuery(projectName: string) {
  const account = useAccountContext();
  return useQuery(
    ["activityHistory", projectName],
    () => getHistoryByProject(projectName, account.username),
    {
      enabled: !!account,
    }
  );
}
