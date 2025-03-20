import { Add, Remove } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Phase } from "~/hooks/fetching/phase";
import { useRemoveTaskFromPhaseMutation } from "~/hooks/fetching/phase/query";
import AddTaskToPhaseDialog from "../dialogs/AddTaskToPhaseDialog";
import CreateTaskDialog from "../dialogs/CreateTaskDialog";
interface PhaseDetailsProps {
  phase: Phase;
}
export default function PhaseDetails({ phase }: PhaseDetailsProps) {
  const taskColumn: GridColDef[] = [
    { field: "name", headerName: "Name", width: 400 },
    { field: "status", headerName: "Status" },
    { field: "description", headerName: "Description", minWidth: 400, flex: 1 },
  ];
  const { currentProject } = useParams();
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openCreateTaskDialog, setOpenCreateTaskDialog] = useState(false);
  const removeTaskMutation = useRemoveTaskFromPhaseMutation();
  const [selectedRows, setSelectedRows] = useState<string[]>([""]);
  function handleDeleteSelectedTask(id: string) {
    const phaseId = id;
    selectedRows.forEach((taskId) => {
      removeTaskMutation.mutate({ phaseId, taskId, currentProject });
    });
  }
  function onTaskRowSelect(arrayOfIds: GridRowSelectionModel) {
    const array = arrayOfIds as string[];
    setSelectedRows(array);
  }
  return (
    <Card sx={{ width: "100%" }}>
      <CardHeader title="List of tasks in this phase" />
      <CardContent
        sx={{
          minHeight: {
            md: 100,
            lg: 150,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          autoHeight
          rows={phase.tasks}
          getRowId={(row) => row._id}
          columns={taskColumn}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[]}
          onRowSelectionModelChange={onTaskRowSelect}
        />
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="warning"
          startIcon={<Add />}
          onClick={() => setOpenCreateTaskDialog(true)}
        >
          Create a new task
        </Button>
        <Button
          onClick={() => setOpenTaskDialog(true)}
          variant="contained"
          startIcon={<Add />}
        >
          Add tasks
        </Button>
        <Button
          color="error"
          onClick={() => handleDeleteSelectedTask(phase._id)}
          variant="contained"
          startIcon={<Remove />}
        >
          Remove selected tasks
        </Button>
      </CardActions>
      <CreateTaskDialog
        open={openCreateTaskDialog}
        setOpen={setOpenCreateTaskDialog}
      />
      <AddTaskToPhaseDialog open={openTaskDialog} setOpen={setOpenTaskDialog} />
    </Card>
  );
}
