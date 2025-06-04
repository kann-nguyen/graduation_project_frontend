import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  getAllArtifacts,
  getArtifact,
  updateArtifact,
  updateArtifactRateScan,
  getArtifactPhase,
} from "~/hooks/fetching/artifact/axios";
import { ArtifactUpdate } from ".";
import { toast } from "~/utils/toast";

export function useArtifactsQuery(projectName: string) {
  return useQuery(
    ["artifacts", projectName], 
    () => getAllArtifacts(projectName),
    {
      // Poll every 3 seconds when any artifact is scanning
      refetchInterval: (data) => {
        const artifacts = data?.data || [];
        const hasScanning = artifacts.some((artifact: any) => artifact.isScanning);
        return hasScanning ? 3000 : false; // Poll every 3 seconds if scanning, otherwise no polling
      },
      refetchIntervalInBackground: true, // Continue polling even when tab is not focused
    }
  );
}

export function useArtifactQuery(artifactId: string) {
  return useQuery(
    ["artifact", artifactId], 
    () => getArtifact(artifactId),
    {
      // Poll every 3 seconds when the artifact is scanning
      refetchInterval: (data) => {
        const artifact = data?.data;
        return artifact?.isScanning ? 3000 : false; // Poll every 3 seconds if scanning, otherwise no polling
      },
      refetchIntervalInBackground: true, // Continue polling even when tab is not focused
    }
  );
}
export function useUpdateArtifactMutation() {
  interface UpdateArtifact {
    artifactId: string;
    artifact: ArtifactUpdate;
  }
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ artifactId, artifact }: UpdateArtifact) =>
      updateArtifact(artifactId, artifact),
    onSuccess: (response, { artifactId }) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["artifact", artifactId]);
        queryClient.invalidateQueries(["phase"]);
      });
    },
  });
}

export function useUpdateArtifactRateScanMutation() {
  interface UpdateArtifactRateScan {
    artifactId: string;
    rate: number;
  }
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ artifactId, rate }: UpdateArtifactRateScan) =>
      updateArtifactRateScan(artifactId, rate),
    onSuccess: (response, { artifactId }) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["artifact", artifactId]);
        queryClient.invalidateQueries(["phase"]);
      });
    },
  });
}

export function useArtifactPhaseQuery(artifactId: string) {
  return useQuery(
    ["artifact", artifactId, "phase"],
    () => getArtifactPhase(artifactId),
    {
      enabled: !!artifactId,
    }
  );
}
