import {
  SxProps,
  useTheme,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  CssBaseline,
  Stack,
} from "@mui/material";
import dayjs from "dayjs";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActivityHistory } from "~/hooks/fetching/history";
import Empty from "/empty.png";
function dateFormatter(date: string) {
  return dayjs(date).format("DD/MM/YY");
}

function countHistory(array: ActivityHistory[]) {
  const counts: any = {};

  array.forEach((obj) => {
    const formattedDate = dateFormatter(obj.createdAt);

    if (formattedDate in counts) {
      counts[formattedDate]++;
    } else {
      counts[formattedDate] = 1;
    }
  });

  const result = Object.entries(counts).map(([date, count]) => ({
    date,
    count,
  }));

  return result;
}
export default function TimelineChart({
  activityHistory,
  sx,
}: {
  activityHistory: ActivityHistory[] | null | undefined;
  sx?: SxProps;
}) {
  if (!activityHistory || activityHistory.length === 0) {
    return (
      <Card>
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
  const theme = useTheme();
  activityHistory.sort((a, b) => {
    return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
  });
  const count = countHistory(activityHistory);
  return (
    <Card sx={sx}>
      <CardHeader title="Activity timeline" />
      <CardContent>
        <ResponsiveContainer width="100%" aspect={3 / 1}>
          <LineChart width={600} height={400} data={count}>
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line
              dataKey="count"
              type="monotone"
              stroke={theme.palette.primary.main}
              name="Number of activities"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
