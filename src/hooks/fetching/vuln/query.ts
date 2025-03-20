import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { toast } from "~/utils/toast";
import {
  addResolution,
  approveResolution,
  getResolution,
  getVulnProgress,
} from "./axios";

export function useVulnProgress(projectName: string) {
  return useQuery(["progress", projectName], () =>
    getVulnProgress(projectName)
  );
}
export function useAddResolutionMutation() {
  interface Params {
    cveId: string;
    description: string;
  }
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cveId, description }: Params) =>
      addResolution(cveId, description),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["resolution"]);
        queryClient.invalidateQueries(["changeHistory"]);
      });
    },
  });
}
export function useGetResolutionQuery(cveId: string[]) {
  return useQuery(["resolution"], () => getResolution(cveId));
}
export function useApproveResolutionMutation() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resolutionId: string) => approveResolution(resolutionId),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["resolution"]);
        queryClient.invalidateQueries(["changeHistory"]);
      });
    },
  });
}
