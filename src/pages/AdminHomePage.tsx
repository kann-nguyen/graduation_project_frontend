import { Box, Container, Grid, Toolbar } from "@mui/material";
import DefaultToolCard from "~/components/cards/DefaultToolCard";
import RecentChangeActivityCard from "~/components/cards/RecentChangeActivityCard";
import TotalActiveUsers from "~/components/cards/TotalActiveUsersCard";
import TotalPhaseTemplates from "~/components/cards/TotalPhaseTemplatesCard";
import TotalScanningTools from "~/components/cards/TotalScanningToolsCard";
import RoleDistributionChart from "~/components/charts/RoleDistributionChart";
import { useAccountsQuery } from "~/hooks/fetching/account/query";
import { usePhaseTemplatesQuery } from "~/hooks/fetching/phase/query";
import { useGetScanners } from "~/hooks/fetching/scanner/query";
export default function AdminHomePage() {
  const accountsQuery = useAccountsQuery();
  const accounts = accountsQuery.data?.data ?? [];
  const scanningToolsQuery = useGetScanners();
  const scanners = scanningToolsQuery.data?.data ?? [];
  const phaseTemplateQuery = usePhaseTemplatesQuery();
  const phaseTemplates = phaseTemplateQuery.data?.data ?? [];
  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TotalActiveUsers total={accounts.length} />
          </Grid>
          <Grid item xs={3}>
            <TotalScanningTools total={scanners.length} />
          </Grid>
          <Grid item xs={3}>
            <DefaultToolCard name="Grype" />
          </Grid>
          <Grid item xs={3}>
            <TotalPhaseTemplates total={phaseTemplates.length} />
          </Grid>
          <Grid item xs={4}>
            <RoleDistributionChart
              accounts={accounts}
              sx={{ height: "100%" }}
            />
          </Grid>
          <Grid item xs={8}>
            <RecentChangeActivityCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
