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

export default function ScannerDetails({ phase }: ScannerDetailsProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const removeScannerMutation = useRemoveScannerFromPhaseMutation();
  
  // Make sure each scanner has a proper ID property
  const phaseScanners = phase.scanners 
    ? phase.scanners.map((scanner, index) => {
        // Ensure each scanner has a valid ID by checking for _id, id, or generating one
        const scannerId = scanner._id?.toString() || 
                         (typeof scanner.id === 'string' || typeof scanner.id === 'number' ? scanner.id : null) || 
                         `scanner-${index}`;
        return {
          ...scanner,
          id: scannerId
        };
      })
    : [];
  
  const handleRemoveScanner = (scannerId: string) => {
    removeScannerMutation.mutate({
      phaseId: phase._id,
      scannerId,
    });
  };

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
      <CardHeader title="Scanning Tools" />
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
      
      {/* Dialog for adding scanners */}
      <AddScannerDialog 
        open={openDialog} 
        setOpen={setOpenDialog} 
        phaseId={phase._id}
        phaseScanners={phaseScanners}
      />
    </Card>
  );
}