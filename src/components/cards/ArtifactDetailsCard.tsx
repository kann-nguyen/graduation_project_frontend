
import {
  Add,
  Delete,
  ArticleOutlined,
  BugReport,
  Security,
  Code,
  ContentPaste,
  GridView,
  LibraryBooks,
  NavigateNext
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
  Grid,
  Chip,
  alpha,
  useTheme,
  CircularProgress
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmActionDialog from "~/components/dialogs/ConfirmActionDialog";
import CreateArtifactDialog from "~/components/dialogs/CreateArtifactDialog";
import { Phase } from "~/hooks/fetching/phase";
import { useRemoveArtifactFromPhaseMutation } from "~/hooks/fetching/phase/query";
import { useSearchParams } from "react-router-dom";
import { Docker } from "~/components/layout-components/Icons";

interface ArtifactDetailsProps {
  phase: Phase;
}

/**
 * Component hiển thị chi tiết artifacts trong phase
 * Bao gồm danh sách artifacts, thông tin vulnerability/threat, và các thao tác quản lý
 * @param phase - Thông tin chi tiết của phase chứa artifacts
 */
export default function ArtifactDetails({ phase }: ArtifactDetailsProps) {
  // Hooks để điều hướng và lấy params
  const navigate = useNavigate();
  const { currentProject } = useParams();
  
  // State quản lý các dialog
  const [openArtCreateDialog, setOpenArtCreateDialog] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>("");
  
  // Theme để lấy màu sắc
  const theme = useTheme();
  
  // Hook để xóa artifact khỏi phase
  const removeArtifactMutation = useRemoveArtifactFromPhaseMutation();

  /**
   * Hàm điều hướng đến trang chi tiết artifact
   * @param id - ID của artifact cần xem chi tiết
   */
  function handleViewArtifact(id: string) {
    // Navigate to the new ArtifactDetail page with the artifact ID
    const projectPath = encodeURIComponent(currentProject || '');
    navigate(`/${projectPath}/artifact/${id}`);
  }
  
  /**
   * Hàm xử lý khi user muốn xóa artifact
   * @param id - ID của artifact cần xóa
   */
  function handleDeleteArtifact(id: string) {
    setSelectedArtifactId(id);
    setConfirmModal(true);
  }

  /**
   * Hàm thực hiện xóa artifact sau khi user xác nhận
   */
  async function removeArtifact() {
    if (selectedArtifactId) {
      removeArtifactMutation.mutate({
        phaseId: phase._id,
        artifactId: selectedArtifactId,
      });
    }
  }
  
  /**
   * Hàm trả về icon tương ứng với loại artifact
   * @param type - Loại artifact (image, log, source code, executable, library)
   * @returns JSX Element icon
   */
  const getArtifactTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Docker />;
      case 'log':
        return <ContentPaste />;
      case 'source code':
        return <Code />;
      case 'executable':
        return <GridView />;
      case 'library':
        return <LibraryBooks />;
      default:
        return <ArticleOutlined />;
    }
  };
  
  /**
   * Hàm trả về màu sắc tương ứng với loại artifact
   * @param type - Loại artifact
   * @returns Màu từ theme palette
   */
  const getArtifactTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return theme.palette.info.main;
      case 'source code':
        return theme.palette.success.main;
      case 'log':
        return theme.palette.warning.main;
      case 'executable':
        return theme.palette.error.main;
      case 'library':
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Card sx={{ width: "100%" }}>
      {/* Header với title và nút thêm artifact */}
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">Artifacts</Typography>
            <Button
              startIcon={<Add />}
              onClick={() => setOpenArtCreateDialog(true)}
              variant="contained"
              size="small"
            >
              Add a new artifact
            </Button>
          </Box>
        } 
      />
      
      {/* Nội dung chính hiển thị danh sách artifacts */}
      <CardContent
        sx={{
          minHeight: {
            md: 100,
            lg: 150,
          },
          pb: 3
        }}
      >
        {phase.artifacts.length > 0 ? (
          <Grid container spacing={2}>
            {phase.artifacts.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                {/* Card cho mỗi artifact với hover effect */}
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleViewArtifact(item._id)}
                >
                  {/* Badge hiển thị trạng thái scanning */}
                  {item.isScanning && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      bgcolor: alpha(theme.palette.warning.main, 0.9),
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderBottomLeftRadius: 8,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <CircularProgress size={12} color="inherit" />
                      SCANNING
                    </Box>
                  )}
                  
                  {/* Badge hiển thị trạng thái invalid */}
                  {item.state === "invalid" && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: item.isScanning ? 32 : 0, 
                      right: 0, 
                      bgcolor: alpha(theme.palette.error.main, 0.9),
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderBottomLeftRadius: 8,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    }}>
                      INVALID
                    </Box>
                  )}
                  
                  {/* Nút xóa artifact */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    zIndex: 10,
                    // Điều chỉnh vị trí khi có badge
                    ...(item.isScanning || item.state === "invalid") && {
                      top: item.isScanning && item.state === "invalid" ? 72 : 
                           item.isScanning || item.state === "invalid" ? 40 : 8
                    }
                  }}>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.95)',
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArtifact(item._id);
                      }}
                    >
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                  
                  {/* Nội dung chính của artifact card */}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Thông tin cơ bản: icon, tên, loại */}
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {/* Icon container với màu theo loại artifact */}
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: alpha(getArtifactTypeColor(item.type), 0.1),
                            color: getArtifactTypeColor(item.type),
                            mr: 1.5
                          }}
                        >
                          {getArtifactTypeIcon(item.type)}
                        </Box>
                        <Box>
                          <Typography variant="h6" noWrap sx={{ maxWidth: 150 }}>
                            {item.name}
                          </Typography>
                          {/* Chip hiển thị loại artifact */}
                          <Chip 
                            label={item.type}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(getArtifactTypeColor(item.type), 0.1),
                              color: getArtifactTypeColor(item.type),
                              fontWeight: 'medium'
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Thông tin version nếu có */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {item.version && (
                        <Tooltip title="Version">
                          <Chip 
                            label={`v${item.version}`} 
                            size="small" 
                            variant="outlined" 
                          />
                        </Tooltip>
                      )}
                    </Box>
                    
                    {/* Thông tin thống kê vulnerabilities và threats */}
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Tooltip title="Vulnerabilities">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BugReport fontSize="small" color="error" />
                            <Typography variant="body2">
                              {item.vulnerabilityList?.length || 0} Vulnerabilities
                            </Typography>
                          </Box>
                        </Tooltip>
                        
                        <Tooltip title="Threats">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Security fontSize="small" color="primary" />
                            <Typography variant="body2">
                              {item.threatList?.length || 0} Threats
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                      
                      {/* Nút xem chi tiết */}
                      <Button
                        endIcon={<NavigateNext />}
                        size="small"
                      >
                        Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            borderRadius: 2,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            <ArticleOutlined sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No artifacts found in this phase
            </Typography>
            <Button 
              startIcon={<Add />}
              onClick={() => setOpenArtCreateDialog(true)}
              variant="outlined" 
              size="small"
              sx={{ mt: 1 }}
            >
              Add Your First Artifact
            </Button>
          </Box>
        )}
      </CardContent>
      
      {/* Các dialog */}
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
