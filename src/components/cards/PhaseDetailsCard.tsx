
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
// Import types và hooks
import { Phase } from "~/hooks/fetching/phase";
import { useRemoveTaskFromPhaseMutation } from "~/hooks/fetching/phase/query";
// Import dialog components
import AddTaskToPhaseDialog from "../dialogs/AddTaskToPhaseDialog";
import CreateTaskDialog from "../dialogs/CreateTaskDialog";

// Interface định nghĩa props của component
interface PhaseDetailsProps {
  phase: Phase;
}
/**
 * Component hiển thị chi tiết phase với danh sách task và các thao tác quản lý
 * @param phase - Thông tin chi tiết của phase
 */
export default function PhaseDetails({ phase }: PhaseDetailsProps) {
  // Cấu hình các cột cho DataGrid hiển thị danh sách task
  const taskColumn: GridColDef[] = [
    { field: "name", headerName: "Name", width: 400 },
    { field: "status", headerName: "Status" },
    { field: "description", headerName: "Description", minWidth: 400, flex: 1 },
  ];
  
  // Lấy thông tin project hiện tại từ URL params
  const { currentProject } = useParams();
  
  // State quản lý việc mở/đóng các dialog
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openCreateTaskDialog, setOpenCreateTaskDialog] = useState(false);
  
  // Hook để xóa task khỏi phase
  const removeTaskMutation = useRemoveTaskFromPhaseMutation();
  
  // State lưu trữ các task được chọn trong DataGrid
  const [selectedRows, setSelectedRows] = useState<string[]>([""]);
  
  /**
   * Hàm xử lý xóa các task đã chọn khỏi phase
   * @param id - ID của phase
   */
  function handleDeleteSelectedTask(id: string) {
    const phaseId = id;
    selectedRows.forEach((taskId) => {
      removeTaskMutation.mutate({ phaseId, taskId, currentProject });
    });
  }
  
  /**
   * Hàm xử lý khi user chọn/bỏ chọn task trong DataGrid
   * @param arrayOfIds - Mảng ID các task được chọn
   */
  function onTaskRowSelect(arrayOfIds: GridRowSelectionModel) {
    const array = arrayOfIds as string[];
    setSelectedRows(array);
  }
  return (
    <Card sx={{ width: "100%" }}>
      {/* Header của card */}
      <CardHeader title="List of tasks in this phase" />
      
      {/* Nội dung chính chứa DataGrid */}
      <CardContent
        sx={{
          minHeight: {
            md: 100,
            lg: 150,
          },
        }}
      >
        {/* DataGrid hiển thị danh sách task với checkbox selection */}
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
      
      {/* Actions chứa các nút điều khiển */}
      <CardActions>
        {/* Nút tạo task mới */}
        <Button
          variant="contained"
          color="warning"
          startIcon={<Add />}
          onClick={() => setOpenCreateTaskDialog(true)}
        >
          Create a new task
        </Button>
        
        {/* Nút thêm task có sẵn vào phase */}
        <Button
          onClick={() => setOpenTaskDialog(true)}
          variant="contained"
          startIcon={<Add />}
        >
          Add tasks
        </Button>
        
        {/* Nút xóa các task đã chọn */}
        <Button
          color="error"
          onClick={() => handleDeleteSelectedTask(phase._id)}
          variant="contained"
          startIcon={<Remove />}
        >
          Remove selected tasks
        </Button>
      </CardActions>
      
      {/* Các dialog */}
      <CreateTaskDialog
        open={openCreateTaskDialog}
        setOpen={setOpenCreateTaskDialog}
      />
      <AddTaskToPhaseDialog open={openTaskDialog} setOpen={setOpenTaskDialog} />
    </Card>
  );
}
