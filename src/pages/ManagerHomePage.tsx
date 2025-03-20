import { Box, Container, Grid, Toolbar } from "@mui/material";
import { useParams } from "react-router-dom";
import MemberCard from "~/components/cards/MemberCard";
import ProjectInfo from "~/components/cards/ProjectInfoCard";
import TotalCommits from "~/components/cards/TotalCommitsCard";
import TotalPullRequests from "~/components/cards/TotalPullCard";
import Chart from "~/components/charts/ActivityHistoryChart";
import { useActivityHistoryQuery } from "~/hooks/fetching/history/query";

export default function ManagerHomePage() {
  const { currentProject } = useParams();
  const actHistQuery = useActivityHistoryQuery(currentProject);
  const actHist = actHistQuery.data?.data;
  if (!actHist) return <></>;
  const commits = actHist.filter((x) => x.action === "commit");
  const pullRequests = actHist.filter((x) => x.action === "pr");
  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={12} sm={12} md={6}>
            <Grid item xs={12} sm={6}>
              <TotalCommits total={commits.length} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TotalPullRequests total={pullRequests.length} />
            </Grid>
            <Grid item xs={12}>
              <MemberCard />
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={12} sm={12} md={6}>
            <Grid item xs={12}>
              <ProjectInfo />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Chart activityHistory={actHist} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
