import { Add, Code } from "@mui/icons-material";
import { Button, Card, CardContent, CardHeader, SxProps, Tooltip } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
} from "@mui/x-data-grid";
import { useState } from "react";
import { useGetScanners } from "~/hooks/fetching/scanner/query";
import EditScannerDialog from "../dialogs/EditScannerDialog";
import { useSearchParams } from "react-router-dom";
import AddNewToolDialog from "../dialogs/AddNewToolDialog";

export default function ScanningToolManagementCard({ sx }: { sx?: SxProps }) {
  function handleViewCode(id: GridRowId) {
    return async () => {
      setSearchParams({ scannerId: id as string });
      setOpen(true);
    };
  }
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "createdBy",
      headerName: "Created by",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      headerAlign: "center",
      align: "center",
      cellClassName: "actions",
      renderCell: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={
              <Tooltip title="View code">
                <Code />
              </Tooltip>
            }
            label="View code"
            className="textPrimary"
            onClick={handleViewCode(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];
  const [, setSearchParams] = useSearchParams();
  const [openAdd, setOpenAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const scanningToolsQuery = useGetScanners();
  const scanners = scanningToolsQuery.data?.data ?? [];
  return (
    <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardHeader 
        title="Scanning tool" 
        action={
          <Button
            startIcon={<Add />}
            onClick={() => setOpenAdd(true)}
          >
            Add new scanner
          </Button>
        }
      />
      <CardContent sx={{ 
        width: '100%', 
        padding: 2, 
        flexGrow: 1,
        '& .MuiDataGrid-root': {
          border: 'none',
          width: '100%'
        }
      }}>
        <DataGrid
          columns={columns}
          rows={scanners}
          getRowId={(row) => row._id}
          autoHeight
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          sx={{ 
            width: '100%',
            '& .MuiDataGrid-main': { width: '100%' },
            '& .MuiDataGrid-virtualScroller': { width: '100%' },
            '& .MuiDataGrid-columnsContainer': { width: '100%' },
            '& .MuiDataGrid-cell': { maxWidth: 'none !important' },
            '& .MuiDataGrid-row': { width: '100%' },
            '& .MuiDataGrid-root': { width: '100%' },
            '& .MuiDataGrid-footerContainer': { width: '100%' },
            '& .MuiDataGrid-columnHeaders': { width: '100%' },
          }}
        />
      </CardContent>
      <EditScannerDialog open={open} setOpen={setOpen} />
      <AddNewToolDialog open={openAdd} setOpen={setOpenAdd} />
    </Card>
  );
}
