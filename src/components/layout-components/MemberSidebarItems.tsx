import {
  AssignmentOutlined,
  FactCheckOutlined,
  HomeOutlined,
  SecurityOutlined,
  DashboardOutlined,
} from "@mui/icons-material";
import { Divider, List, ListSubheader } from "@mui/material";
import { useParams } from "react-router-dom";
import { useProjectInQuery } from "~/hooks/fetching/user/query";
import { Item } from "./SidebarItem";
export default function MemberSidebarItems() {
  const projectInQuery = useProjectInQuery();
  const projects = projectInQuery.data?.data;
  const firstProject = projects ? encodeURIComponent(projects[0]?.name) : "";
  let { currentProject } = useParams();
  if (!currentProject) {
    currentProject = firstProject;
  }
  const encodedUrl = encodeURIComponent(currentProject);
  return (
    <List component="nav">
      <Item text="Home" icon={<HomeOutlined />} path={`/${encodedUrl}/`} />
      <Item
        text="Projects"
        icon={<DashboardOutlined />}
        path={`/${encodedUrl}/projects`}
      />
      <Item
        text="Ticket"
        icon={<FactCheckOutlined />}
        path={`/${encodedUrl}/tickets`}
      />
      <Item
        text="Task"
        icon={<AssignmentOutlined />}
        path={`/${encodedUrl}/tasks`}
      />
    </List>
  );
}
