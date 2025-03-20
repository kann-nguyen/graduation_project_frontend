import { Box, Container, Grid, Toolbar } from "@mui/material";
import { useParams } from "react-router-dom";
import ProjectInfo from "~/components/cards/ProjectInfoCard";
import RecentActivity from "~/components/cards/RecentActivityCard";
import TimelineChart from "~/components/charts/TimelineChart";
import TaskAssigned from "~/components/cards/TaskAssignedCard";
import TicketAssigned from "~/components/cards/TicketAssignedCard";
import { useActivityHistoryOfUserQuery } from "~/hooks/fetching/history/query";
import { useUserByAccountIdQuery } from "~/hooks/fetching/user/query";

export default function MemberHomePage() {
  const { currentProject } = useParams();
  const actHistQuery = useActivityHistoryOfUserQuery(currentProject);
  const actHistData = actHistQuery.data?.data;
  const userQuery = useUserByAccountIdQuery();
  const user = userQuery.data?.data;
  if (!user) return <></>;
  const { taskAssigned, ticketAssigned } = user;
  return (
    <Box sx={{ flexGrow: 1, height: "100vh" }}>
      <Toolbar />
      <Container sx={{ my: 4, py: 4 }} maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <RecentActivity
              activityHistory={actHistData}
              sx={{ height: "100%" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProjectInfo />
          </Grid>
          <Grid item xs={12}>
            <TimelineChart activityHistory={actHistData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TaskAssigned tasks={taskAssigned} sx={{ height: 450 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TicketAssigned tickets={ticketAssigned} sx={{ height: 450 }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
