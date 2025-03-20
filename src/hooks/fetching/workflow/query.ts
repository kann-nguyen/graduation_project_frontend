import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkflows, pushNewWorkflow } from "./axios";
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
