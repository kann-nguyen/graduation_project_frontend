import {
  Add,
  BugReport,
  Code,
  ContentPaste,
  CreateOutlined,
  DeleteOutlined,
  GridView,
  LibraryBooks,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ConfirmActionDialog from "~/components/dialogs/ConfirmActionDialog";
import CreateArtifactDialog from "~/components/dialogs/CreateArtifactDialog";
import UpdateArtifactDialog from "~/components/dialogs/UpdateArtifactDialog";
import { Phase } from "~/hooks/fetching/phase";
import { useRemoveArtifactFromPhaseMutation } from "~/hooks/fetching/phase/query";
import { Docker } from "~/icons/Icons";
import AddThreatDialog from "../dialogs/AddThreatDialog";
import ThreatDictionaryDialog from "../dialogs/ThreatDictionaryDialog";
import { useSearchParams } from "react-router-dom";
function renderType({
  type,
}: {
  type: "image" | "log" | "source code" | "executable" | "library";
}) {
  switch (type) {
    case "image":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Image</Typography>
          <Docker />
        </Stack>
      );
    case "log":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Log</Typography>
          <ContentPaste />
        </Stack>
      );
    case "source code":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Source code</Typography>
          <Code />
        </Stack>
      );
    case "executable":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Executable</Typography>
          <GridView />
        </Stack>
      );
    case "library":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Library</Typography>
          <LibraryBooks />
        </Stack>
      );
  }
}
interface ArtifactDetailsProps {
  phase: Phase;
}
export default function ArtifactDetails({ phase }: ArtifactDetailsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const artifactId = searchParams.get("artifactId") ?? "";
  const [openDictionary, setOpenDictionary] = useState(false);
  const [openAddThreatDialog, setOpenAddThreatDialog] = useState(false);
  const [openArtCreateDialog, setOpenArtCreateDialog] = useState(false);
  const [openArtUpdateDialog, setOpenArtUpdateDialog] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  function handleUpdateSelectedArtifact(id: string) {
    return () => {
      setSearchParams({ artifactId: id });
      setOpenArtUpdateDialog(true);
    };
  }
  function handleDeleteSelectedArtifact(id: string) {
    return () => {
      setSearchParams({ artifactId: id });
      setConfirmModal(true);
    };
  }
  const removeArtifactMutation = useRemoveArtifactFromPhaseMutation();
  async function removeArtifact() {
    removeArtifactMutation.mutate({
      phaseId: phase._id,
      artifactId,
    });
  }
  return (
    <Card sx={{ width: "100%" }}>
      <CardHeader title="Artifacts" />
      <CardContent
        sx={{
          minHeight: {
            md: 100,
            lg: 150,
          },
        }}
      >
        <Box display="flex" flexWrap="wrap">
          {phase.artifacts.length > 0 ? (
            phase.artifacts.map((item) => (
              <Card key={item._id} sx={{ minWidth: "10%", m: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {item.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {renderType(item)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={handleUpdateSelectedArtifact(item._id)}>
                    <CreateOutlined />
                  </IconButton>
                  <IconButton onClick={handleDeleteSelectedArtifact(item._id)}>
                    <DeleteOutlined />
                  </IconButton>
                </CardActions>
              </Card>
            ))
          ) : (
            <Box display="flex" justifyContent="center" width="100%">
              <Typography variant="h6" component="div">
                There's no artifact...Add one by clicking the button below
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button
          startIcon={<Add />}
          onClick={() => setOpenArtCreateDialog(true)}
          variant="contained"
        >
          Add a new artifact
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<BugReport />}
          onClick={() => setOpenAddThreatDialog(true)}
        >
          Add a new threat
        </Button>
        <Button
          variant="contained"
          color="info"
          startIcon={<BugReport />}
          onClick={() => setOpenDictionary(true)}
        >
          Threat dictionary
        </Button>
      </CardActions>
      <CreateArtifactDialog
        open={openArtCreateDialog}
        setOpen={setOpenArtCreateDialog}
        phaseId={phase._id}
      />
      <UpdateArtifactDialog
        open={openArtUpdateDialog}
        setOpen={setOpenArtUpdateDialog}
      />
      <ConfirmActionDialog
        open={confirmModal}
        setOpen={setConfirmModal}
        callback={removeArtifact}
        text="Do you want to delete this artifact? This will also remove any ticket that is linked to its vulnerabilities"
      />
      <AddThreatDialog
        open={openAddThreatDialog}
        setOpen={setOpenAddThreatDialog}
      />
      <ThreatDictionaryDialog
        open={openDictionary}
        setOpen={setOpenDictionary}
      />
    </Card>
  );
}
