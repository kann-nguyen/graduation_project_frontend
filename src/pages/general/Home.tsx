import { useUserRole } from "~/hooks/general";
import MemberHomePage from "../member/MemberHomePage";
import AdminHomePage from "../admin/AdminHomePage";
import ManagerHomePage from "../member/ManagerHomePage";
import SecurityExpertHomePage from "../member/SecurityExpertHomePage";

export default function Home() {
  const role = useUserRole();
  
  switch (role) {
    case "project_manager":
      return <ManagerHomePage />;
    case "security_expert":
      return <SecurityExpertHomePage />;
    case "member":
      return <MemberHomePage />;
    case "admin":
    default:
      return <AdminHomePage />;
  }
}
