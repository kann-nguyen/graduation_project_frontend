import {
  Card,
  CardContent,
  CardHeader,
  SxProps,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActivityHistory } from "~/hooks/fetching/history";
function reshapeActHistToRecharts(activityHistory: ActivityHistory[]) {
  // Turn activity history into a format that can be used by Recharts: An array of object with shape: {createdBy: string, totalCommits: number, totalPrs: number}
  const reshaped: {
    createdBy: string;
    totalCommits: number;
    totalPrs: number;
  }[] = [];
  activityHistory.forEach((x) => {
    const existing = reshaped.find((y) => y.createdBy === x.createdBy);
    if (existing) {
      if (x.action === "commit") existing.totalCommits += 1;
      else if (x.action === "pr") existing.totalPrs += 1;
    } else {
      const newEntry = {
        createdBy: x.createdBy,
        totalCommits: x.action === "commit" ? 1 : 0,
        totalPrs: x.action === "pr" ? 1 : 0,
      };
      reshaped.push(newEntry);
    }
  });
  return reshaped;
}
export default function Chart({
  activityHistory,
  sx,
}: {
  activityHistory: ActivityHistory[];
  sx?: SxProps;
}) {
  const reshapedActHist = reshapeActHistToRecharts(activityHistory);
  const theme = useTheme();
  const lessThanMedium = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Card sx={sx}>
      <CardHeader title="Activity history" />
      <CardContent>
        <ResponsiveContainer width="100%" aspect={3 / 1}>
          <BarChart
            width={500}
            height={300}
            data={reshapedActHist}
            barSize={20}
          >
            <XAxis
              dataKey="createdBy"
              hide={lessThanMedium}
              axisLine={false}
              tickLine={false}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={false} />
            <Legend />
            <Bar
              dataKey="totalCommits"
              fill={theme.palette.primary.main}
              name="Number of commits"
            />
            <Bar
              dataKey="totalPrs"
              fill={alpha(theme.palette.primary.main, 0.25)}
              name="Number of pull requests"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
