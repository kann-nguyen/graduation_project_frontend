import api from "~/api";
import { Account, AccountUpdate, ChangePassword } from ".";
import { PromiseServer } from "~/hooks/fetching/response-type";
export async function getAccountInfo(): PromiseServer<Account> {
  const response = await api.get("/account/");
  return response.data;
}
export async function getAllAccounts(): PromiseServer<Account[]> {
  const response = await api.get("/account/list");
  return response.data;
}
export async function getAccountById(id: string): PromiseServer<Account> {
  const response = await api.get(`/account/${id}`);
  return response.data;
}
export async function updateAccount(
  id: string,
  updateData: AccountUpdate
): PromiseServer<null> {
  const response = await api.patch(`/account/${id}`, {
    data: updateData,
  });
  return response.data;
}
export async function deleteAccount(id: string): PromiseServer<null> {
  const response = await api.delete(`/account/${id}`);
  return response.data;
}
export async function getPermissions(): PromiseServer<string[]> {
  const response = await api.get("/permission/");
  return response.data;
}
export async function updateGithubAccessToken(
  accessToken: string
): PromiseServer<null> {
  const response = await api.patch(`/account/thirdParty/github`, {
    data: accessToken,
  });
  return response.data;
}
export async function updateGitlabAccessToken(
  accessToken: string
): PromiseServer<null> {
  const response = await api.patch(`/account/thirdParty/gitlab`, {
    data: accessToken,
  });
  return response.data;
}
export async function disconnectFromGithub(): PromiseServer<null> {
  const response = await api.patch("/account/disconnect/github");
  return response.data;
}
export async function disconnectFromGitlab(): PromiseServer<null> {
  const response = await api.patch("/account/disconnect/gitlab");
  return response.data;
}
export async function updateScannerPreference(
  scanner: string,
  endpoint: string | undefined
): PromiseServer<null> {
  const response = await api.patch("/account/scanner", {
    data: {
      scanner,
      endpoint,
    },
  });
  return response.data;
}
export async function changePassword(
  data: ChangePassword
): PromiseServer<null> {
  const response = await api.patch("/account/password", {
    data,
  });
  return response.data;
}
