import {
  Card,
  CardContent,
  CardHeader,
  SxProps,
  useTheme,
} from "@mui/material";
import { Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Phase } from "~/hooks/fetching/phase";

export default function PhaseTasksChart({
  sx,
  phases,
}: {
  phases: Phase[];
  sx?: SxProps;
}) {
  const theme = useTheme();
  const activeTasksCount = phases
    .map(
      (phase) => phase.tasks.filter((task) => task.status === "active").length
    )
    .reduce((a, b) => a + b, 0);
  const completedTasksCount = phases
    .map(
      (phase) =>
        phase.tasks.filter((task) => task.status === "completed").length
    )
    .reduce((a, b) => a + b, 0);
  return (
    <Card sx={sx}>
      <CardHeader title="Tasks" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              data={[
                {
                  name: "Active",
                  value: activeTasksCount,
                  fill: theme.palette.secondary.main,
                },
                {
                  name: "Completed",
                  value: completedTasksCount,
                  fill: theme.palette.success.main,
                },
              ]}
              innerRadius={80}
              outerRadius={100}
              label
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
