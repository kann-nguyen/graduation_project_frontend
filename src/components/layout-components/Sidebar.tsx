import { Divider, Drawer, Toolbar } from "@mui/material";
import { useUserRole } from "~/hooks/general";
import AdminSidebarItems from "./AdminSidebarItems";
import ProjectManagerSidebarItems from "./ProjectManagerSidebarItems";
import SecurityExpertSidebarItems from "./SecurityExpertSidebarItems";
import MemberSidebarItems from "./MemberSidebarItems";
export interface ItemProps {
  text: string;
  icon: JSX.Element;
  path: string;
}
function DrawerItems() {
  const role = useUserRole();
  switch (role) {
    case "admin":
      return <AdminSidebarItems />;
    case "project_manager":
      return <ProjectManagerSidebarItems />;
    case "security_expert":
      return <SecurityExpertSidebarItems />;
    case "member":
    default:
      return <MemberSidebarItems />;
  }
}
export default function Sidebar() {
  return (
    <Drawer
      sx={{
        width: 300,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 300,
          boxSizing: "border-box",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      />
      <Divider />
      <DrawerItems />
    </Drawer>
  );
}
