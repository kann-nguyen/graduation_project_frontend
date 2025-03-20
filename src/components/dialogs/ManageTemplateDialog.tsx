import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useDeleteTemplateMutation,
  usePhaseTemplatesQuery,
} from "~/hooks/fetching/phase/query";
import { useAccountContext } from "~/hooks/general";
import PhaseTemplateDetailsDialog from "./PhaseTemplateDetailsDialog";
import { Add } from "@mui/icons-material";
import CreateNewTemplateDialog from "./CreateNewTemplateDialog";
import ConfirmActionDialog from "./ConfirmActionDialog";
export default function ManageTemplateDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const accountContext = useAccountContext();
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const deleteTemplateMutation = useDeleteTemplateMutation();
  const templatesQuery = usePhaseTemplatesQuery();
  const templates =
    templatesQuery.data?.data?.filter(
      (x) => x.createdBy == accountContext.username
    ) ?? [];
  function editTemplate(id: string) {
    setSearchParams({ templateId: id });
    setOpenEdit(true);
  }
  function deleteTemplate(id: string) {
    setSearchParams({ templateId: id });
    setOpenDelete(true);
  }
  function handleDelete() {
    const templateId = searchParams.get("templateId") ?? "";
    deleteTemplateMutation.mutate(templateId);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Templates you own</DialogTitle>
      <DialogContent>
        <Stack direction="row">
          {templates.map((temp) => {
            return (
              <Card sx={{ m: 1, minWidth: 300 }} key={temp.name}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {temp.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {temp.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => editTemplate(temp._id)}>
                    Edit
                  </Button>
                  <PhaseTemplateDetailsDialog
                    open={openEdit}
                    setOpen={setOpenEdit}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => deleteTemplate(temp._id)}
                  >
                    Delete
                  </Button>
                  <ConfirmActionDialog
                    open={openDelete}
                    setOpen={setOpenDelete}
                    text="Are you sure you want to delete this template?"
                    callback={handleDelete}
                  />
                </CardActions>
              </Card>
            );
          })}
          <Card sx={{ m: 1, minWidth: 300 }} key="add">
            <CardContent sx={{ height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Button
                  startIcon={<Add fontSize="large" />}
                  onClick={() => setOpenCreate(true)}
                >
                  Add a new template
                </Button>
                <CreateNewTemplateDialog
                  open={openCreate}
                  setOpen={setOpenCreate}
                />
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
