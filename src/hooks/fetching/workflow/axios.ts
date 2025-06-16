import api from "~/api";
import { Workflow, WorkflowHistory, WorkflowStats } from ".";
import { PromiseServer } from "~/hooks/fetching/response-type";

export async function getWorkflows(
  projectName: string
): PromiseServer<Workflow[]> {
  const response = await api.get("/workflow", {
    params: { projectName },
  });
  return response.data;
}

export async function pushNewWorkflow(
  projectName: string,
  branch: string | undefined,
  data: Workflow,
  message: string
): PromiseServer<null> {
  const response = await api.post("/workflow", {
    projectName,
    branch,
    data,
    message,
  });
  return response.data;
}

// Artifact Workflow History
export async function getArtifactWorkflowHistory(
  artifactId: string
): PromiseServer<WorkflowHistory> {
  try {
    // Updated to match backend route with hyphen
    const response = await api.get(`/artifact-workflow/artifacts/${artifactId}/workflow/history`);
    console.log('Workflow history response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow history:', error);
    throw error;
  }
}

// Project Workflow Stats
export async function getProjectWorkflowStats(
  projectId: string
): PromiseServer<WorkflowStats> {
  try {
    // Updated to match backend route with hyphen
    const response = await api.get(`/artifact-workflow/projects/${projectId}/workflow/stats`);
    console.log('Workflow stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow stats:', error);
    throw error;
  }
}

// Get Artifacts by Workflow Step
export async function getArtifactsByWorkflowStep(
  projectId: string,
  step?: number
): PromiseServer<any[]> {
  try {
    // Updated to match backend route with hyphen
    const response = await api.get(`/artifact-workflow/projects/${projectId}/workflow/artifacts`, {
      params: { step },
    });
    console.log('Artifacts by workflow step response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching artifacts by workflow step:', error);
    throw error;
  }
}
