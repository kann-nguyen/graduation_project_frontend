import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { toast } from "~/utils/toast";
import { AccountRegister, AccountUpdate, ChangePassword } from ".";
import {
  deleteAccount,
  disconnectFromGithub,
  disconnectFromGitlab,
  getAccountById,
  getAllAccounts,
  getPermissions,
  updateGithubAccessToken,
  updateAccount,
  updateScannerPreference,
  updateGitlabAccessToken,
  changePassword,
} from "./axios";
import { updateAccountContext } from "~/hooks/general";
import { register } from "../auth/axios";

export function useAccountsQuery() {
  return useQuery(["accounts"], getAllAccounts);
}
export function useAccountByIdQuery(id: string) {
  return useQuery(["account", id], () => getAccountById(id));
}
export function useAccountUpdateMutation() {
  interface AccountUpdateParams {
    id: string;
    updateData: AccountUpdate;
  }
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ id, updateData }: AccountUpdateParams) =>
      updateAccount(id, updateData),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["accounts"]);
        queryClient.invalidateQueries(["account"]);
      });
    },
  });
}
export function usePermissionListQuery() {
  return useQuery(["permissions"], getPermissions);
}
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["accounts"]);
      });
    },
  });
}
export function useUpdateGithubAccessTokenMutation() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (accessToken: string) => updateGithubAccessToken(accessToken),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, async () => {
        await updateAccountContext();
      });
    },
  });
}
export function useUpdateGitlabAccessTokenMutation() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (accessToken: string) => updateGitlabAccessToken(accessToken),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, async () => {
        await updateAccountContext();
      });
    },
  });
}
export function useDisconnectFromGithubMutation() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: disconnectFromGithub,
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, async () => {
        await updateAccountContext();
      });
    },
  });
}
export function useDisconnectFromGitlabMutation() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: disconnectFromGitlab,
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, async () => {
        await updateAccountContext();
      });
    },
  });
}
export function useUpdateScannerPreferenceMutation() {
  interface Params {
    scanner: string;
    endpoint: string | undefined;
  }
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ scanner, endpoint }: Params) =>
      updateScannerPreference(scanner, endpoint),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, async () => {
        await updateAccountContext();
      });
    },
  });
}
export function useCreateAccountAdminMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (account: AccountRegister) => register(account),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["accounts"]);
      });
    },
  });
}
export function useChangePasswordMutation() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (data: ChangePassword) => changePassword(data),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {});
    },
  });
}
