import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import CreateTaskDialog from "~/components/dialogs/CreateTaskDialog";
import OverdueTaskCard from "~/components/cards/OverdueTaskCard";
import TaskProgressCard from "~/components/cards/TaskProgressCard";
import ExtendedTaskTable from "~/components/cards/TaskTableCard";
import { Task } from "~/hooks/fetching/task";
import { useUserByAccountIdQuery } from "~/hooks/fetching/user/query";

function getProgressTotal(tasks: Task[]) {
  const total = tasks.length;
  if (total === 0) return 100;
  const completed = tasks.filter((task) => task.status === "completed").length;
  return (completed / total) * 100;
}

export default function Task() {
  const [open, setOpen] = useState(false);
  const memberInfoQuery = useUserByAccountIdQuery();
  const memberInfo = memberInfoQuery.data?.data;
  // Find the number of overdue tasks
  const overdueTasks = memberInfo?.taskAssigned.filter((x) => {
    const dueDate = new Date(x.dueDate);
    return dueDate < new Date() && x.status === "active";
  });
  const overdueCount = overdueTasks?.length ?? 0;
  if (!memberInfo) return <></>;
  return (
    <Box
      flexGrow={1}
      sx={{
        m: {
          xs: 2,
          sm: 4,
        },
        overflow: "auto",
      }}
    >
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">Tasks</Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Create a task
            </Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <OverdueTaskCard total={overdueCount} sx={{ height: "100%" }} />
            </Grid>
            <Grid item xs={4}>
              <TaskProgressCard
                value={getProgressTotal(memberInfo.taskAssigned)}
              />
            </Grid>
            <Grid item xs={12}>
              <ExtendedTaskTable tasks={memberInfo.taskAssigned} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
      <CreateTaskDialog open={open} setOpen={setOpen} />
    </Box>
  );
}
