import { Divider, List, ListSubheader } from "@mui/material";
import { useParams } from "react-router-dom";
import { useProjectInQuery } from "~/hooks/fetching/user/query";
import { Item } from "./SidebarItem";
import {
  FactCheckOutlined,
  HomeOutlined,
  BugReportOutlined,
} from "@mui/icons-material";

export default function SecurityExpertSidebarItems() {
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

      <Item text="Dashboard" icon={<HomeOutlined />} path={`/${encodedUrl}/`} />
      <Item 
        text="Vulnerabilities" 
        icon={<BugReportOutlined />} 
        path={`/${encodedUrl}/vulnerabilities`} 
      />

      <Item
        text="Tickets"
        icon={<FactCheckOutlined />}
        path={`/${encodedUrl}/tickets`}
      />
    </List>
  );
}