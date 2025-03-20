import api from "~/api";
import { PromiseServer } from "~/hooks/fetching/response-type";
import { User } from ".";
import { Project } from "../project";
export async function getUserById(memberId: string): PromiseServer<User> {
  const response = await api.get(`/user/`, {
    params: {
      memberId,
    },
  });
  return response.data;
}
export async function getUserByAccountId(
  accountId: string
): PromiseServer<User> {
  const response = await api.get(`/user/`, {
    params: {
      accountId,
    },
  });
  return response.data;
}
export async function assignTask(
  taskId: string,
  memberId: string
): PromiseServer<null> {
  const response = await api.patch(`/user/${memberId}/assign/${taskId}`);
  return response.data;
}
export async function getProjectIn(): PromiseServer<Project[]> {
  const response = await api.get(`/user/project`);
  return response.data;
}
export async function updateUser(
  name: string | undefined,
  email: string | undefined
): PromiseServer<null> {
  const response = await api.patch(`/user/`, {
    name,
    email,
  });
  return response.data;
}
export async function getAllUsers(): PromiseServer<User[]> {
  const response = await api.get(`/user/getAll`);
  return response.data;
}
