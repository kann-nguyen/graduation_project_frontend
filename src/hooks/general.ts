import { create } from "zustand";
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

// Create a store without persist middleware
const useLoginStore = create<LoginStore>((set) => ({
  account: {} as Account,
  setAccountContext: (account) => set({ account }),
}));

export const useAccountContext = () => useLoginStore((state) => state.account);

export const updateAccountContext = async () => {
  try {
    const { data } = await getAccountInfo();
    if (data) {
      useLoginStore.getState().setAccountContext(data);
    }
  } catch (error) {
    console.error('Failed to update account context:', error);
  }
};
