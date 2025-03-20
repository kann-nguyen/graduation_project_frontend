import api from "~/api";
import { Cwe } from "~/hooks/fetching/cwe";
import { PromiseServer } from "~/hooks/fetching/response-type";
export async function getCwe(id: string): PromiseServer<Cwe> {
  const response = await api.get(`/cwe/${id}`);
  return response.data;
}
