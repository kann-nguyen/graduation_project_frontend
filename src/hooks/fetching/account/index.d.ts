export interface ThirdParty {
  name: string;
  username: string;
  accessToken: string;
}
export interface Account {
  _id: string;
  username: string;
  email: string;
  thirdParty: ThirdParty[];
  role: "admin" | "manager" | "member";
  permission: string[];
  scanner: {
    endpoint?: string;
    details: Scanner;
  };
}
export interface AccountUpdate {
  email: string;
  role: "manager" | "member";
  permission: string[];
}
export interface AccountRegister {
  username: string;
  email: string;
  confirmPassword: string;
  password: string;
}
export interface ChangePassword {
  oldPassword: string;
  confirmPassword: string;
  newPassword: string;
}
