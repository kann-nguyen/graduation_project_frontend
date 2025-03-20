import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Account } from "~/hooks/fetching/account";
import { getAccountInfo } from "./fetching/account/axios";
export const usePermissionHook = () => {
  const accountInfo = useAccountContext();
  return accountInfo.permission;
};
export const useUserRole = () => {
  const accountInfo = useAccountContext();
  return accountInfo.role;
};
interface LoginStore {
  account: Account;
  setAccountContext: (account: Account) => void;
}
const useLoginStore = create<LoginStore>()(
  persist(
    (set) => ({
      account: {} as Account,
      setAccountContext: (account) => set({ account }),
    }),
    {
      name: "login-store",
    }
  )
);
export const useAccountContext = () => useLoginStore((state) => state.account);
export const updateAccountContext = async () => {
  const store = useLoginStore.getState();
  const updateStore = store.setAccountContext;
  const { data } = await getAccountInfo();
  if (data) updateStore(data);
};
