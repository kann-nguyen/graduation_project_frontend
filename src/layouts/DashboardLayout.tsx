import { Outlet } from "react-router-dom";
import QueryBoundaries from "~/components/layout-components/QueryBoundaries";
import Sidebar from "~/components/layout-components/Sidebar";
import Topbar from "~/components/layout-components/Topbar";
export default function DashboardLayout() {
  return (
    <QueryBoundaries>
      <Topbar />
      <Sidebar />
      <Outlet />
    </QueryBoundaries>
  );
}
