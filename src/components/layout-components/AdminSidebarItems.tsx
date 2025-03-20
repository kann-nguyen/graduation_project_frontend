import {
  AccountCircleOutlined,
  BuildOutlined,
  HomeOutlined,
  PatternOutlined,
} from "@mui/icons-material";
import { List } from "@mui/material";
import { Item } from "./SidebarItem";
export default function AdminSidebarItems() {
  return (
    <List component="nav">
      <Item text="Overview" icon={<HomeOutlined />} path={`/admin/home`} />
      <Item
        text="Account"
        icon={<AccountCircleOutlined />}
        path={`/admin/accounts`}
      />
      <Item
        text="Template"
        icon={<PatternOutlined />}
        path={`/admin/templates`}
      />
      <Item
        text="Scanning tool"
        icon={<BuildOutlined />}
        path={`/admin/tools`}
      />
    </List>
  );
}
