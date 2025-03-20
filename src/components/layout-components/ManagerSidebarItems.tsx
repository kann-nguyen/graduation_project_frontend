import { Divider, List, ListSubheader } from "@mui/material";
import { useParams } from "react-router-dom";
import { useProjectInQuery } from "~/hooks/fetching/user/query";
import { Item } from "./SidebarItem";
import {
  AssessmentOutlined,
  DescriptionOutlined,
  FactCheckOutlined,
  HomeOutlined,
  SecurityOutlined,
} from "@mui/icons-material";

export default function ManagerSidebarItems() {
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
      <ListSubheader component="div" inset>
        Project navigation
      </ListSubheader>
      <Item text="Home" icon={<HomeOutlined />} path={`/${encodedUrl}/`} />
      <Item
        text="Phase"
        icon={<AssessmentOutlined />}
        path={`/${encodedUrl}/phases`}
      />
      <Item
        text="Script"
        icon={<DescriptionOutlined />}
        path={`/${encodedUrl}/scripts`}
      />
      <Item
        text="Ticket"
        icon={<FactCheckOutlined />}
        path={`/${encodedUrl}/tickets`}
      />
      <Divider />
      <ListSubheader component="div" inset>
        Vulnerability control
      </ListSubheader>
      <Item
        text="Vulnerabilities"
        icon={<SecurityOutlined />}
        path={`/${encodedUrl}/vulnerabilities`}
      />
    </List>
  );
}
