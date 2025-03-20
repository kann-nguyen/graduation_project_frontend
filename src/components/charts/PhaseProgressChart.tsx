import {
  Card,
  CardContent,
  CardHeader,
  SxProps,
  useTheme,
} from "@mui/material";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Phase } from "~/hooks/fetching/phase";
function getPhaseProgressChartData(phases: Phase[]) {
  const data = [];
  for (const phase of phases) {
    const completedTasksCount = phase.tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const totalTasksCount = phase.tasks.length;
    const calcPercent =
      totalTasksCount === 0
        ? 0
        : Math.round((completedTasksCount / totalTasksCount) * 100);
    data.push({
      name: phase.name,
      percent: calcPercent,
    });
  }
  return data;
}
export default function PhaseProgressChart({
  phases,
  sx,
}: {
  phases: Phase[];
  sx?: SxProps;
}) {
  const theme = useTheme();
  const chartData = getPhaseProgressChartData(phases);
  return (
    <Card sx={sx}>
      <CardHeader title="Progress" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Bar
              dataKey="percent"
              fill={theme.palette.success.main}
              barSize={30}
            >
              <LabelList
                dataKey="percent"
                position="bottom"
                formatter={(value: number) => `${value}%`}
                fill={theme.palette.success.main}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
