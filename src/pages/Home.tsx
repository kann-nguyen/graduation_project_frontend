import { useUserRole } from "~/hooks/general";
import MemberHomePage from "./MemberHomePage";
import AdminHomePage from "./AdminHomePage";
import ProjectManagerHomePage from "./ProjectManagerHomePage";
import SecurityExpertHomePage from "./SecurityExpertHomePage";

export default function Home() {
  const role = useUserRole();
  
  switch (role) {
    case "project_manager":
      return <ProjectManagerHomePage />;
    case "security_expert":
      return <SecurityExpertHomePage />;
    case "member":
      return <MemberHomePage />;
    case "admin":
    default:
      return <AdminHomePage />;
  }
}
