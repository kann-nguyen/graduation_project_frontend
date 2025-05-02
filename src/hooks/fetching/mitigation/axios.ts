import api from "~/api";
import { Mitigation, MitigationCreate, MitigationUpdate } from ".";
import { PromiseServer } from "~/hooks/fetching/response-type";

/**
 * Get all mitigations for a specific threat
 */
export async function getMitigationsForThreat(threatId: string): PromiseServer<Mitigation[]> {
  const response = await api.get(`/mitigation/threat/${threatId}`);
  return response.data;
}

/**
 * Get all mitigations in the system
 */
export async function getAllMitigations(): PromiseServer<Mitigation[]> {
  const response = await api.get("/mitigation");
  return response.data;
}

/**
 * Create a new mitigation and add it to a threat
 */
export async function createMitigation(mitigation: MitigationCreate): PromiseServer<{mitigation: Mitigation}> {
  const response = await api.post("/mitigation", {
    data: mitigation,
  });
  return response.data;
}

/**
 * Update an existing mitigation
 */
export async function updateMitigation(
  mitigationId: string,
  data: MitigationUpdate
): PromiseServer<{mitigation: Mitigation}> {
  const response = await api.patch(`/mitigation/${mitigationId}`, {
    data,
  });
  return response.data;
}

/**
 * Remove a mitigation from a threat and delete it
 */
export async function deleteMitigation(
  mitigationId: string,
  threatId: string
): PromiseServer<null> {
  const response = await api.delete(`/mitigation/${mitigationId}/threat/${threatId}`);
  return response.data;
}