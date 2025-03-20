import { Add, Delete, MoreHoriz } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  SxProps,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
} from "@mui/x-data-grid";
import {
  useDeleteTemplateMutation,
  usePhaseTemplatesQuery,
} from "~/hooks/fetching/phase/query";
import PhaseTemplateDetailsDialog from "../dialogs/PhaseTemplateDetailsDialog";
import { useState } from "react";
import ConfirmActionDialog from "../dialogs/ConfirmActionDialog";
import { useSearchParams } from "react-router-dom";
import CreateNewTemplateDialog from "../dialogs/CreateNewTemplateDialog";

export default function PhaseTemplateMgmtCard({ sx }: { sx?: SxProps }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const templateId = searchParams.get("templateId") ?? "";
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const phaseTemplateQuery = usePhaseTemplatesQuery();
  const deleteTemplateMutation = useDeleteTemplateMutation();
  const phaseTemplates = phaseTemplateQuery.data?.data ?? [];
  function handleViewDetails(id: GridRowId) {
    setSearchParams({ templateId: id as string });
    setOpenView(true);
  }
  function handleDelete(id: GridRowId) {
    setSearchParams({ templateId: id as string });
    setOpenDelete(true);
  }
  function deleteAction() {
    deleteTemplateMutation.mutate(templateId);
  }
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 0.5,
    },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "createdBy", headerName: "Created by" },
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
              <Tooltip title="Details">
                <MoreHoriz />
              </Tooltip>
            }
            label="Details"
            className="textPrimary"
            onClick={() => handleViewDetails(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={
              <Tooltip title="Delete">
                <Delete />
              </Tooltip>
            }
            label="Delete"
            className="textPrimary"
            onClick={() => handleDelete(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];
  return (
    <Card sx={sx}>
      <CardHeader title="Phase template" />
      <CardContent>
        <DataGrid
          rows={phaseTemplates}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </CardContent>
      <PhaseTemplateDetailsDialog open={openView} setOpen={setOpenView} />
      <CardActions>
        <Button startIcon={<Add />} onClick={() => setOpenCreate(true)}>
          Add new template
        </Button>
        <CreateNewTemplateDialog open={openCreate} setOpen={setOpenCreate} />
        <ConfirmActionDialog
          open={openDelete}
          setOpen={setOpenDelete}
          text="Are you sure to delete this template?"
          callback={deleteAction}
        />
      </CardActions>
    </Card>
  );
}
