import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import { useAddTaskToPhaseMutation } from "~/hooks/fetching/phase/query";
import { useAvailableTasksQuery } from "~/hooks/fetching/task/query";

export default function AddTaskToPhaseDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const addTaskMutation = useAddTaskToPhaseMutation();
  const taskColumn: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200 },
    { field: "status", headerName: "Status" },
    { field: "description", headerName: "Description", minWidth: 400, flex: 1 },
  ];
  const { currentProject, phaseId } = useParams();
  const taskQuery = useAvailableTasksQuery(currentProject);
  const availableTasks = taskQuery.data?.data ?? [];
  async function handleDoubleClick(params: GridRowParams) {
    const { id } = params;
    const taskId = id.toString();
    addTaskMutation.mutate({ phaseId, taskId, currentProject });
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg">
      <DialogTitle>Add tasks to phase</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Double click on a task to add it to this phase
        </DialogContentText>
        <DataGrid
          rows={availableTasks}
          columns={taskColumn}
          autoHeight
          onRowDoubleClick={handleDoubleClick}
          getRowId={(row) => row._id}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setOpen(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
