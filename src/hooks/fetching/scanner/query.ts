import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNewScanner,
  getAllScanners,
  getOneScanner,
  getSampleCode,
  updateScanner,
} from "./axios";
import { useSnackbar } from "notistack";
import { toast } from "~/utils/toast";

export function useSampleCode() {
  return useQuery(["sample"], getSampleCode);
}
export function useCreateNewScannerMutation() {
  return useMutation({
    mutationFn: (data: CreateOrUpdateNewScanner) => createNewScanner(data),
  });
}
export function useGetScanners(createdBy?: string) {
  if (!createdBy) return useQuery(["scanners"], () => getAllScanners());
  return useQuery(["scanners", createdBy], () => getAllScanners(createdBy), {
    enabled: !!createdBy,
  });
}
export function useGetScanner(id: string) {
  return useQuery(["scanner", id], () => getOneScanner(id));
}
export function useUpdateScannerMutation() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrUpdateNewScanner) => updateScanner(data),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["scanners"]);
        if (response.status === "success") {
          navigator.clipboard.writeText(response.data);
        }
      });
    },
  });
}
