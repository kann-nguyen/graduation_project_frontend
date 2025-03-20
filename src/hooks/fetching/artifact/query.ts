import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  getAllArtifacts,
  getArtifact,
  updateArtifact,
} from "~/hooks/fetching/artifact/axios";
import { ArtifactUpdate } from ".";
import { toast } from "~/utils/toast";

export function useArtifactsQuery(projectName: string) {
  return useQuery(["artifacts", projectName], () =>
    getAllArtifacts(projectName)
  );
}
export function useArtifactQuery(artifactId: string) {
  return useQuery(["artifact", artifactId], () => getArtifact(artifactId));
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
