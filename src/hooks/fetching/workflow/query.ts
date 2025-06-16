import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getWorkflows, 
  pushNewWorkflow, 
  getArtifactWorkflowHistory,
  getProjectWorkflowStats,
  getArtifactsByWorkflowStep
} from "./axios";
import { useSnackbar } from "notistack";
import { toast } from "~/utils/toast";
import { Workflow } from ".";

export function useGetWorkflowsQuery(projectName: string) {
  return useQuery(["workflows", projectName], () => getWorkflows(projectName), {
    enabled: !!projectName,
  });
}

export function useUpdateWorkflowMutation() {
  interface WorkflowUpdate {
    projectName: string;
    branch: string | undefined;
    data: Workflow;
    message: string;
  }
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ projectName, branch, data, message }: WorkflowUpdate) =>
      pushNewWorkflow(projectName, branch, data, message),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["workflows"]);
      });
    },
  });
}

// Query hook for artifact workflow history
export function useArtifactWorkflowHistoryQuery(artifactId: string) {
  return useQuery(
    ["artifactWorkflow", "history", artifactId], 
    () => getArtifactWorkflowHistory(artifactId),
    {
      enabled: !!artifactId,
      refetchInterval: (data) => {
        // Refetch every 10 seconds if the workflow is not completed
        if (data?.data) {
          const cycles = data.data;
          const latestCycle = Array.isArray(cycles) && cycles.length > 0 
            ? cycles[cycles.length - 1] 
            : null;
            
          // If the latest cycle is not completed, refetch
          if (latestCycle && !latestCycle.completedAt) {
            return 10000; // 10 seconds
          }
        }
        return false;
      },
      retry: 2,
      onError: (error) => {
        console.error("Failed to fetch artifact workflow history:", error);
      }
    }
  );
}

// Query hook for project workflow stats
export function useProjectWorkflowStatsQuery(projectId: string) {
  return useQuery(
    ["projectWorkflow", "stats", projectId],
    () => getProjectWorkflowStats(projectId),
    {
      enabled: !!projectId,
      refetchInterval: 30000, // Refetch every 30 seconds to keep stats up to date
      retry: 2,
      onError: (error) => {
        console.error("Failed to fetch project workflow stats:", error);
      }
    }
  );
}

// Query hook for artifacts by workflow step
export function useArtifactsByWorkflowStepQuery(projectId: string, step?: number) {
  return useQuery(
    ["artifactsByWorkflowStep", projectId, step],
    () => getArtifactsByWorkflowStep(projectId, step),
    {
      enabled: !!projectId,
      retry: 2,
      onError: (error) => {
        console.error("Failed to fetch artifacts by workflow step:", error);
      }
    }
  );
}
