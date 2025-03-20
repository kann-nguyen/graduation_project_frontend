import { useQuery } from "@tanstack/react-query";
import { getAdminChangeHistory, getChangeHistory } from "./axios";

export function useChangeHistoryQuery(objectId: string) {
  return useQuery(["changeHistory", objectId], () =>
    getChangeHistory(objectId)
  );
}
export function useAdminChangeHistoryQuery(total: number) {
  return useQuery(["changeHistory", total], () => getAdminChangeHistory(total));
}
