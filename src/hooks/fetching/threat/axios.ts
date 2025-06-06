import { PromiseServer } from "~/hooks/fetching/response-type";
import api from "~/api";
import { Threat, ThreatCreate, ThreatUpdate } from ".";

export async function getThreats(): PromiseServer<Threat[]> {
  const response = await api.get("/threat");
  return response.data;
}
export async function getThreat(id: string | number): PromiseServer<Threat> {
  if (typeof id !== "string") {
    id = id.toString();
  }
  const response = await api.get(`/threat/${id}`);
  return response.data;
}
export async function createThreat(threat: ThreatCreate): PromiseServer<null> {
  const response = await api.post("/threat", {
    data: threat,
  });
  return response.data;
}
export async function updateThreat(
  id: string,
  data: ThreatUpdate
): PromiseServer<null> {
  const response = await api.patch(`/threat/${id}`, {
    data,
  });
  return response.data;
}

// Get detailed threat information
export async function getDetailedThreatInfo(id: string | number): PromiseServer<any> {
  if (typeof id !== "string") {
    id = id.toString();
  }
  const response = await api.get(`/threat/${id}/model_details`);
  return response.data;
}

// Get suggested fixes for a threat
export async function getSuggestedFixes(id: string | number): PromiseServer<any> {
  if (typeof id !== "string") {
    id = id.toString();
  }
  const response = await api.get(`/threat/${id}/model_suggest`);
  return response.data;
}
