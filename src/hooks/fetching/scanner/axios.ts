import api from "~/api";
import { PromiseServer } from "../response-type";

export async function getSampleCode(): PromiseServer<Sample> {
  const response = await api.get("/scanner/sample");
  return response.data;
}

export async function createNewScanner(
  data: CreateOrUpdateNewScanner
): PromiseServer<string> {
  const response = await api.post("/scanner", {
    data,
  });
  return response.data;
}

export async function getAllScanners(
  createdBy?: string
): PromiseServer<Scanner[]> {
  const response = await api.get("/scanner", {
    params: {
      createdBy,
    },
  });
  return response.data;
}

export async function getOneScanner(id: string): PromiseServer<Scanner> {
  const response = await api.get(`/scanner/${id}`);
  return response.data;
}

export async function updateScanner(
  data: CreateOrUpdateNewScanner
): PromiseServer<string> {
  const response = await api.put("/scanner", {
    data,
  });
  return response.data;
}
