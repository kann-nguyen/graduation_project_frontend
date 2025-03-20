import { Commit } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { PullRequest } from "~/icons/Icons";
import { ActivityHistory } from "~/hooks/fetching/history";
import Empty from "/empty.png";
export default function RecentActivity({
  activityHistory,
  sx,
}: {
  activityHistory: ActivityHistory[] | null | undefined;
  sx?: SxProps;
}) {
  if (!activityHistory || activityHistory.length === 0) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardHeader title="Activity timeline" />
        <CardContent>
          <Stack sx={{ alignItems: "center" }}>
            <img
              src={Empty}
              style={{
                width: 150,
                height: 150,
              }}
            />
            <Typography color="error" variant="h6" align="center">
              No activity found! Have you linked your Github/Gitlab account?
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }
  const lastRecentAct = activityHistory
    .sort((a, b) => {
      const dateB = new Date(b.createdAt);
      const dateA = new Date(a.createdAt);
      return dateB.valueOf() - dateA.valueOf();
    })
    .slice(0, 5);
  return (
    <Card sx={sx}>
      <CardHeader title="Recent activity" />
      <CardContent>
        <List>
          {lastRecentAct.map((act) => (
            <ListItem key={act._id}>
              <ListItemIcon>
                {act.action === "commit" ? <Commit /> : <PullRequest />}
              </ListItemIcon>
              <ListItemText
                primary={act.content}
                secondary={`Created: ${dayjs(act.createdAt).format(
                  "DD/MM/YYYY"
                )}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
