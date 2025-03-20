import api from "~/api";
import { AccountRegister } from "~/hooks/fetching/account";
import { PromiseServer } from "~/hooks/fetching/response-type";

export async function login(username: string, password: string) {
  const response = await api.post("/auth/login", { username, password });
  return response;
}
export async function logout() {
  const response = await api.get("/auth/logout");
  return response;
}
export async function register(data: AccountRegister): PromiseServer<null> {
  const response = await api.post("/account/reg", data);
  return response.data;
}
