import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Toolbar,
  Typography,
  debounce,
} from "@mui/material";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import CommitScriptChange from "~/components/dialogs/CommitScriptChangeDialog";
import { Workflow } from "~/hooks/fetching/workflow";
import { useGetWorkflowsQuery } from "~/hooks/fetching/workflow/query";
function NoWorkflow() {
  return (
    <Box sx={{ flexGrow: 1, height: "100vh" }}>
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Stack spacing={3}>
          <Typography variant="h4">Workflow scripts</Typography>
          <Card sx={{ p: 2 }}>
            <CardContent
              sx={{
                height: 550,
              }}
            >
              <Stack
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Typography variant="h5">
                  Found no workflow in this project.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
export default function Script() {
  const { control, handleSubmit, getValues } = useForm();
  const { currentProject } = useParams();
  const [open, setOpen] = useState(false);
  const workflowQuery = useGetWorkflowsQuery(currentProject);
  const [selectedWorkFlow, setSelectedWorkflow] = useState<
    Workflow | undefined
  >();
  const workflows = workflowQuery.data?.data;
  useEffect(() => {
    if (workflows) {
      setSelectedWorkflow(workflows[0]);
    }
  }, [workflows]);
  if (!workflows || !selectedWorkFlow || workflows.length === 0)
    return <NoWorkflow />;
  async function onSubmit() {
    const code = getValues("code");
    setSelectedWorkflow((workflow) => {
      if (!workflow) return;
      return {
        ...workflow,
        content: code,
      };
    });
    setOpen(true);
  }
  function changeSelectedWorkflow(event: SelectChangeEvent<string>) {
    const name = event.target.value;
    const workflow = workflows?.find((workflow) => workflow.name === name);
    if (workflow) {
      setSelectedWorkflow(workflow);
    }
  }
  return (
    <Box sx={{ flexGrow: 1, height: "100vh" }}>
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Stack spacing={3}>
          <Typography variant="h4">Workflow scripts</Typography>
          <Card sx={{ p: 2 }}>
            <CardHeader
              title="Editor"
              action={
                <Select
                  value={selectedWorkFlow.name}
                  onChange={changeSelectedWorkflow}
                >
                  {workflows.map((workflow) => (
                    <MenuItem key={workflow.name} value={workflow.name}>
                      {workflow.name}
                    </MenuItem>
                  ))}
                </Select>
              }
            />
            <CardContent sx={{ height: 550 }}>
              <Controller
                name="code"
                control={control}
                defaultValue={selectedWorkFlow.content}
                render={({ field }) => (
                  <CodeMirror
                    {...field}
                    extensions={[langs.yaml()]}
                    height="500px"
                  />
                )}
              />
            </CardContent>
            <CardActions sx={{ display: "flex", flexDirection: "row-reverse" }}>
              <Button onClick={handleSubmit(onSubmit)}>
                Commit changes...
              </Button>
            </CardActions>
          </Card>
        </Stack>
      </Container>
      <CommitScriptChange
        open={open}
        setOpen={setOpen}
        workflow={selectedWorkFlow}
      />
    </Box>
  );
}
