import { Box, Container, Grid, Toolbar, Typography, Card, CardContent } from "@mui/material";
import { useParams } from "react-router-dom";
import { useActivityHistoryQuery } from "~/hooks/fetching/history/query";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";
import { useThreatsQuery } from "~/hooks/fetching/threat/query";

export default function SecurityExpertHomePage() {
  const { currentProject } = useParams();
  const ticketsQuery = useTicketsQuery(currentProject);
  const threatsQuery = useThreatsQuery();
  
  const tickets = ticketsQuery.data?.data || [];
  const threats = threatsQuery.data?.data || [];
  
  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Tickets Overview
                </Typography>
                <Typography variant="body1">
                  Open Tickets: {tickets.filter(t => t.status === "Not accepted").length}
                </Typography>
                <Typography variant="body1">
                  Processing Tickets: {tickets.filter(t => t.status === "Processing").length}
                </Typography>
                <Typography variant="body1">
                  Completed Tickets: {tickets.filter(t => t.status === "Submitted").length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Threat Analysis
                </Typography>
                <Typography variant="body1">
                  Total Threats: {threats.length}
                </Typography>
            
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            {/* Additional security-focused components can be added here */}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}