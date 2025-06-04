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
  if (phaseList.length === 0) return <CreatePhaseTemplate />;  return (
    <Box sx={{ flexGrow: 1 }}>
      <Toolbar />
      <Container sx={{ my: 4, pb: 4 }} maxWidth="xl">
        <Stack spacing={4}>          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {project.name}
              </Typography>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button variant="outlined" color="primary" size="small" onClick={() => setOpen(true)}>
                  Manage phase templates
                </Button>
                <Button 
                  variant="contained" 
                  color="success"
                  size="small"
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
            </Box>
            
            {project.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {project.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Phases:</strong> {phaseList.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
              </Typography>
              {project.updatedAt && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Last Updated:</strong> {new Date(project.updatedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            
            <ManageTemplateDialog open={open} setOpen={setOpen} />
            <CreatePhaseFromTemplateDialog open={phaseDialogOpen} setOpen={setPhaseDialogOpen} />
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <PhaseBoard phases={phaseList} />
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
            Create phases for your project by using a template or designing a new set of phases.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setOpen(true)}
            >
              Create project phases
            </Button>
          </Stack>
        </Box>
      </Container>
      <CreatePhaseFromTemplateDialog open={open} setOpen={setOpen} />
    </Box>
  );
}
