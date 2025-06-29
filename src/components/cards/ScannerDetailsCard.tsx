
import {
  Add,
  Delete,
  Scanner as ScannerIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { Phase } from "~/hooks/fetching/phase";
import { useRemoveScannerFromPhaseMutation } from "~/hooks/fetching/phase/query";
import AddScannerDialog from "../dialogs/AddScannerDialog";

interface ScannerDetailsProps {
  phase: Phase;
}

/**
 * Component hiển thị danh sách scanner tools trong phase
 * Cho phép thêm, xóa và quản lý các scanning tools để scan vulnerabilities
 * @param phase - Thông tin chi tiết của phase chứa scanners
 */
export default function ScannerDetails({ phase }: ScannerDetailsProps) {
  // State quản lý việc mở/đóng dialog thêm scanner
  const [openDialog, setOpenDialog] = useState(false);
  // Hook để xóa scanner khỏi phase
  const removeScannerMutation = useRemoveScannerFromPhaseMutation();
  
  // Đảm bảo mỗi scanner có ID hợp lệ để sử dụng trong DataGrid
  const phaseScanners = phase.scanners 
    ? phase.scanners.map((scanner, index) => {
        // Kiểm tra và tạo ID hợp lệ cho scanner (_id, id, hoặc generated)
        const scannerId = scanner._id?.toString() || 
                         (typeof scanner.id === 'string' || typeof scanner.id === 'number' ? scanner.id : null) || 
                         `scanner-${index}`;
        return {
          ...scanner,
          id: scannerId
        };
      })
    : [];
  
  /**
   * Hàm xử lý xóa scanner khỏi phase
   * @param scannerId - ID của scanner cần xóa
   */
  const handleRemoveScanner = (scannerId: string) => {
    removeScannerMutation.mutate({
      phaseId: phase._id,
      scannerId,
    });
  };

  // Cấu hình các cột cho DataGrid hiển thị thông tin scanner
  const columns: GridColDef[] = [
    { field: "name", headerName: "Scanner Name", flex: 1 },
    { field: "createdBy", headerName: "Created By", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <Button
          color="error"
          startIcon={<Delete />}
          onClick={() => handleRemoveScanner(params.row._id || params.row.id)}
        >
          Remove
        </Button>
      ),
      flex: 1,
    },
  ];

  return (
    <Card sx={{ width: "100%" }}>
      {/* Header của card */}
      <CardHeader title="Scanning Tools" />
      
      {/* Nội dung chính */}
      <CardContent>
        {phaseScanners.length > 0 ? (
          <DataGrid
            autoHeight
            rows={phaseScanners}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
          />
        ) : (
          <Box display="flex" justifyContent="center" width="100%" py={3}>
            <Stack spacing={2} alignItems="center">
              <ScannerIcon sx={{ fontSize: 60, color: "text.secondary" }} />
              <Typography variant="h6" color="textSecondary">
                No scanners added to this phase
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Add a scanner to enable automated vulnerability scanning
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
      
      {/* Actions chứa nút thêm scanner */}
      <CardActions sx={{ justifyContent: "space-between", flexWrap: "wrap", px: 2, pb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Scanner
        </Button>
      </CardActions>
      
      {/* Dialog để thêm scanner */}
      <AddScannerDialog 
        open={openDialog} 
        setOpen={setOpenDialog} 
        phaseId={phase._id}
        phaseScanners={phaseScanners}
      />
    </Card>
  );
}