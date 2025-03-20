import api from "~/api";
import { Progress, Resolution } from ".";
import { PromiseServer } from "../response-type";

export async function getVulnProgress(
  projectName: string
): PromiseServer<Progress> {
  const response = await api.get("/vuln/progress", {
    params: { projectName },
  });
  return response.data;
}
export async function getResolution(
  cveId: string[]
): PromiseServer<Resolution[]> {
  const response = await api.get(`/vuln/resolution`, {
    params: { cveId },
  });
  return response.data;
}
export async function addResolution(
  cveId: string,
  description: string
): PromiseServer<null> {
  const response = await api.patch(`/vuln/resolution`, {
    data: {
      cveId,
      description,
    },
  });
  return response.data;
}
export async function approveResolution(
  resolutionId: string
): PromiseServer<null> {
  const response = await api.patch(`/vuln/resolution/approve`, {
    data: {
      resolutionId,
    },
  });
  return response.data;
}
