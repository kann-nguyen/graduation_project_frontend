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
import { useParams } from "react-router-dom";
import PhaseBoard from "~/components/cards/PhaseBoard";
import PhaseProgressChart from "~/components/charts/PhaseProgressChart";
import PhaseTasksChart from "~/components/charts/PhaseTasksChart";
import CreatePhaseFromTemplateDialog from "~/components/dialogs/CreatePhaseFromTemplateDialog";
import ManageTemplateDialog from "~/components/dialogs/ManageTemplateDialog";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";

export default function Phase() {
  const [open, setOpen] = useState(false);
  const { currentProject } = useParams();
  const projectQuery = useProjectInfoQuery(currentProject);
  const project = projectQuery.data?.data;
  if (!project) return <></>;
  const { phaseList } = project;
  if (phaseList.length === 0) return <CreatePhaseTemplate />;
  return (
    <Box sx={{ flexGrow: 1, height: "100vh" }}>
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Stack spacing={4}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4">Phases</Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Manage phase templates
            </Button>
            <ManageTemplateDialog open={open} setOpen={setOpen} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PhaseBoard phases={phaseList} />
            </Grid>
            <Grid item xs={5}>
              <PhaseTasksChart phases={phaseList} />
            </Grid>
            <Grid item xs={7}>
              <PhaseProgressChart phases={phaseList} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

function CreatePhaseTemplate() {
  const [open, setOpen] = useState(false);
  return (
    <Box
      sx={{
        flexGrow: "1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Toolbar />
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Box sx={{ display: "flex" }}>
          <Typography variant="h4">
            You haven't created a phase template yet. Do it now?
          </Typography>
          <Button
            variant="contained"
            sx={{ mx: 2 }}
            onClick={() => setOpen(true)}
          >
            Create a phase template
          </Button>
        </Box>
      </Container>
      <CreatePhaseFromTemplateDialog open={open} setOpen={setOpen} />
    </Box>
  );
}
