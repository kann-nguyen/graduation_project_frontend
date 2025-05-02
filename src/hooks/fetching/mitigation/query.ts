// filepath: e:\Workspace\GraduationProject\frontend\src\hooks\fetching\mitigation\query.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { toast } from "~/utils/toast";
import {
  getMitigationsForThreat,
  getAllMitigations,
  createMitigation,
  updateMitigation,
  deleteMitigation
} from "./axios";
import { MitigationCreate, MitigationUpdate } from ".";

/**
 * Hook to fetch all mitigations for a specific threat
 */
export function useMitigationsForThreatQuery(threatId: string) {
  return useQuery(
    ["mitigations", "threat", threatId],
    () => getMitigationsForThreat(threatId),
    {
      enabled: !!threatId,
    }
  );
}

/**
 * Hook to fetch all mitigations in the system
 */
export function useAllMitigationsQuery() {
  return useQuery(["mitigations"], getAllMitigations);
}

/**
 * Hook to create a new mitigation
 */
export function useCreateMitigationMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  return useMutation({
    mutationFn: (mitigation: MitigationCreate) => createMitigation(mitigation),
    onSuccess: (response, variables) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["mitigations", "threat", variables.threatId]);
        queryClient.invalidateQueries(["threats", variables.threatId]);
      });
    },
  });
}

/**
 * Hook to update an existing mitigation
 */
export function useUpdateMitigationMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  return useMutation({
    mutationFn: (params: { mitigationId: string; threatId: string; data: MitigationUpdate }) => 
      updateMitigation(params.mitigationId, params.data),
    onSuccess: (response, variables) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["mitigations", "threat", variables.threatId]);
        queryClient.invalidateQueries(["threats", variables.threatId]);
      });
    },
  });
}

/**
 * Hook to delete a mitigation
 */
export function useDeleteMitigationMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  return useMutation({
    mutationFn: (params: { mitigationId: string; threatId: string }) => 
      deleteMitigation(params.mitigationId, params.threatId),
    onSuccess: (response, variables) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["mitigations", "threat", variables.threatId]);
        queryClient.invalidateQueries(["threats", variables.threatId]);
      });
    },
  });
}