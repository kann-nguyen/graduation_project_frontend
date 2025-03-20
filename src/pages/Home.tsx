import { useUserRole } from "~/hooks/general";
import MemberHomePage from "./MemberHomePage";
import ManagerHomePage from "./ManagerHomePage";
import AdminHomePage from "./AdminHomePage";

export default function Home() {
  const role = useUserRole();
  if (role === "manager") return <ManagerHomePage />;
  else if (role === "member") return <MemberHomePage />;
  else return <AdminHomePage />;
}
