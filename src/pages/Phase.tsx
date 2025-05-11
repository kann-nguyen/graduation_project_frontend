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
  const [phaseDialogOpen, setPhaseDialogOpen] = useState(false);
  const { currentProject } = useParams();
  const projectQuery = useProjectInfoQuery(currentProject);
  const project = projectQuery.data?.data;
  if (!project) return <></>;
  const { phaseList } = project;
  if (phaseList.length === 0) return <CreatePhaseTemplate />;
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Toolbar />
      <Container sx={{ my: 4, pb: 4 }} maxWidth="xl">
        <Stack spacing={4}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4">Phases</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Manage phase templates
              </Button>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => {
                  setOpen(false); // Close the template dialog if open
                  const timeout = setTimeout(() => {
                    setPhaseDialogOpen(true);
                  }, 100);
                  return () => clearTimeout(timeout);
                }}
              >
                Create new phase
              </Button>
            </Stack>
            <ManageTemplateDialog open={open} setOpen={setOpen} />
            <CreatePhaseFromTemplateDialog open={phaseDialogOpen} setOpen={setPhaseDialogOpen} />
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <PhaseBoard phases={phaseList} />
            </Grid>
            <Grid item xs={12} md={5}>
              <PhaseTasksChart phases={phaseList} sx={{ minHeight: 400 }} />
            </Grid>
            <Grid item xs={12} md={7}>
              <PhaseProgressChart phases={phaseList} sx={{ minHeight: 400 }} />
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
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            No phases found in this project
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            You can either create phases from a template or create a new template for future use.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
            >
              Create phases from template
            </Button>
          </Stack>
        </Box>
      </Container>
      <CreatePhaseFromTemplateDialog open={open} setOpen={setOpen} />
    </Box>
  );
}
