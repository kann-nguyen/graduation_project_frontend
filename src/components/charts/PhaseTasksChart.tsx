import {
  Card,
  CardContent,
  CardHeader,
  SxProps,
  Typography,
  useTheme,
  Box,
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
      (phase) => phase.tasks?.filter((task) => task.status === "active").length || 0
    )
    .reduce((a, b) => a + b, 0);
  const completedTasksCount = phases
    .map(
      (phase) =>
        phase.tasks?.filter((task) => task.status === "completed").length || 0
    )
    .reduce((a, b) => a + b, 0);
  
  const totalTasks = activeTasksCount + completedTasksCount;
  
  return (
    <Card sx={sx}>
      <CardHeader title="Tasks" />
      <CardContent>
        {totalTasks > 0 ? (
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
        ) : (
          <Box 
            sx={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No tasks created yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create tasks in phase details to see task statistics here
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
