import { useQuery } from "@tanstack/react-query";
import { getCwe } from "./axios";

export function useCweQuery(id: string) {
  return useQuery(["cwe", id], () => getCwe(id));
}
