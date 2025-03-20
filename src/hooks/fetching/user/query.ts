import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useAccountContext } from "~/hooks/general";
import { toast } from "~/utils/toast";
import {
  assignTask,
  getAllUsers,
  getProjectIn,
  getUserByAccountId,
  getUserById,
  updateUser,
} from "./axios";

export function useUserByAccountIdQuery() {
  const account = useAccountContext();
  return useQuery(
    ["userInfo", account._id],
    () => getUserByAccountId(account._id),
    {
      enabled: !!account,
    }
  );
}

export function useUserQuery(memberId: string) {
  return useQuery(["member", memberId], () => getUserById(memberId));
}

export function useAssignTaskMutation() {
  interface AssignTaskParams {
    taskId: string;
    memberId: string;
  }
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ taskId, memberId }: AssignTaskParams) =>
      assignTask(taskId, memberId),
    onSuccess: (response, { memberId }) => {
      toast(response, enqueueSnackbar, () =>
        queryClient.invalidateQueries(["member", memberId])
      );
    },
  });
}

export function useProjectInQuery() {
  return useQuery(["projectIn"], getProjectIn);
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ name, email }: { name?: string; email?: string }) =>
      updateUser(name, email),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, async () =>
        queryClient.invalidateQueries(["userInfo"])
      );
    },
  });
}

export function useGetAllUsersQuery() {
  return useQuery(["users"], getAllUsers);
}
