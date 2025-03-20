import {
  Abc,
  AccessTime,
  Link as LinkIcon,
  PowerSettingsNew,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";
function renderStatus(status: "active" | "inactive", theme: Theme) {
  if (status === "active")
    return (
      <Typography variant="body1" color={theme.palette.success.main}>
        Active
      </Typography>
    );
  return (
    <Typography variant="body1" color="inherit">
      Inactive
    </Typography>
  );
}
export default function ProjectInfo({ sx }: { sx?: SxProps }) {
  const theme = useTheme();
  const { currentProject } = useParams();
  const projectInfoQuery = useProjectInfoQuery(currentProject);
  const projectInfo = projectInfoQuery.data?.data;
  if (!projectInfo) return <></>;
  const createdAt = dayjs(projectInfo.createdAt).format("DD/MM/YYYY");
  const updatedAt = dayjs(projectInfo.updatedAt).format("DD/MM/YYYY");
  return (
    <Card>
      <CardHeader title="Project details" />
      <CardContent>
        <List>
          <ListItem>
            <ListItemIcon>
              <Abc />
            </ListItemIcon>
            <ListItemText primary="Project name" secondary={projectInfo.name} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <ListItemText
              primary="URL"
              secondary={
                <Link href={projectInfo.url} target="_blank" rel="noopener">
                  {projectInfo.url}
                </Link>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PowerSettingsNew />
            </ListItemIcon>
            <ListItemText
              primary="Status"
              secondary={renderStatus(projectInfo.status, theme)}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTime />
            </ListItemIcon>
            <ListItemText primary="Created at" secondary={createdAt} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTime />
            </ListItemIcon>
            <ListItemText primary="Last updated at" secondary={updatedAt} />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
