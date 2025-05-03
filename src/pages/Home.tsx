import { useUserRole } from "~/hooks/general";
import MemberHomePage from "./MemberHomePage";
import AdminHomePage from "./AdminHomePage";
import ManagerHomePage from "./ManagerHomePage";
import SecurityExpertHomePage from "./SecurityExpertHomePage";

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
