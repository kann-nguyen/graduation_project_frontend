import {
  Add,
  Delete,
  ArticleOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmActionDialog from "~/components/dialogs/ConfirmActionDialog";
import CreateArtifactDialog from "~/components/dialogs/CreateArtifactDialog";
import { Phase } from "~/hooks/fetching/phase";
import { useRemoveArtifactFromPhaseMutation } from "~/hooks/fetching/phase/query";
import { useSearchParams } from "react-router-dom";

interface ArtifactDetailsProps {
  phase: Phase;
}

export default function ArtifactDetails({ phase }: ArtifactDetailsProps) {
  const navigate = useNavigate();
  const { currentProject } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const artifactId = searchParams.get("artifactId") ?? "";
  const [openArtCreateDialog, setOpenArtCreateDialog] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>("");
  
  const removeArtifactMutation = useRemoveArtifactFromPhaseMutation();

  function handleViewArtifact(id: string) {
    // Navigate to the new ArtifactDetail page with the artifact ID
    const projectPath = encodeURIComponent(currentProject || '');
    navigate(`/${projectPath}/artifact/${id}`);
  }
  
  function handleDeleteArtifact(id: string) {
    setSelectedArtifactId(id);
    setConfirmModal(true);
  }

  async function removeArtifact() {
    if (selectedArtifactId) {
      removeArtifactMutation.mutate({
        phaseId: phase._id,
        artifactId: selectedArtifactId,
      });
    }
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
              <Card 
                key={item._id} 
                sx={{ 
                  minWidth: "15%", 
                  m: 2, 
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4
                  }
                }}
              >
                <Tooltip title="Delete artifact" placement="top">
                  <IconButton 
                    size="small" 
                    sx={{ 
                      position: "absolute", 
                      right: 5, 
                      top: 5,
                      background: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        background: "rgba(255,255,255,0.9)",
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteArtifact(item._id);
                    }}
                  >
                    <Delete fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
                <CardContent
                  onClick={() => handleViewArtifact(item._id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ArticleOutlined sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {item.type}
                  </Typography>
                </CardContent>
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
      </CardActions>
      <CreateArtifactDialog
        open={openArtCreateDialog}
        setOpen={setOpenArtCreateDialog}
        phaseId={phase._id}
      />
      <ConfirmActionDialog
        open={confirmModal}
        setOpen={setConfirmModal}
        callback={removeArtifact}
        text="Do you want to delete this artifact? This will also remove any ticket that is linked to its vulnerabilities"
      />
    </Card>
  );
}
