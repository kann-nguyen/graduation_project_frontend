import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Container,
  alpha,
  Grid,
  Fade,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  ListItemAvatar,
  Collapse,
  Tooltip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Security,
  BugReport,
  AssessmentOutlined,
  ScoreboardOutlined,
  InfoOutlined,
  ArrowRightAlt,
  WarningAmberOutlined,
  SettingsOutlined,
  Dangerous,
  Shield,
  ExpandMore,
  ExpandLess,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { getThreat, getDetailedThreatInfo, getSuggestedFixes } from '~/hooks/fetching/threat/axios';
import { getMitigationsForThreat, createMitigation, updateMitigation, deleteMitigation } from '~/hooks/fetching/mitigation/axios';
import { Threat } from '~/hooks/fetching/threat';
import { Mitigation } from '~/hooks/fetching/mitigation';
import { useTheme } from '@mui/material/styles';
import { 
  ThreatPageHeader, 
  SuggestFixCard,
  SuggestedFixesDialog,
  MitigationForm
} from '~/components/cards/ThreatDetailComponents';
import { useAccountContext, useUserRole } from '~/hooks/general';
import { useSnackbar } from 'notistack';

// Component chính hiển thị chi tiết mối đe dọa
export default function ThreatDetail() {
  const { threatId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // State cho dữ liệu mối đe dọa
  const [threat, setThreat] = useState<Threat | null>(null);
  const [detailedInfo, setDetailedInfo] = useState<any>(null);
  const [suggestedFixes, setSuggestedFixes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [openFixDialog, setOpenFixDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Quản lý mitigation (biện pháp giảm thiểu)
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);
  const [isLoadingMitigations, setIsLoadingMitigations] = useState(false);
  const [openNewMitigationDialog, setOpenNewMitigationDialog] = useState(false);
  const [openEditMitigationDialog, setOpenEditMitigationDialog] = useState(false);
  const [currentMitigation, setCurrentMitigation] = useState<Mitigation | null>(null);
  
  // Xác thực quyền truy cập
  const isExpert = useUserRole() === "security_expert";

  // Lấy thông tin cơ bản và chi tiết về mối đe dọa khi tải trang
  useEffect(() => {
    const fetchThreatData = async () => {
      try {
        // Thêm logging để debug khi hook được gọi với giá trị nào
        console.log(`fetchThreatData called with threatId: ${threatId}, type: ${typeof threatId}`);
        
        if (!threatId) {
          console.log('Cannot fetch threat data: threatId is undefined or null');
          return; // Không tiếp tục gọi API nếu threatId không tồn tại
        }
        
        setIsLoading(true);
        // Lấy thông tin cơ bản về mối đe dọa
        const threatResponse = await getThreat(threatId);
        setThreat(threatResponse.data);

        // Lấy thông tin chi tiết về mối đe dọa
        const detailedResponse = await getDetailedThreatInfo(threatId);
        setDetailedInfo(detailedResponse.data);
        
        setError(null);
      } catch (err) {
        console.error(`Error in fetchThreatData: ${err instanceof Error ? err.message : String(err)}`);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreatData();
  }, [threatId]);

  // Lấy các biện pháp giảm thiểu cho mối đe dọa này khi component được tải
  useEffect(() => {
    // Chỉ lấy mitigations nếu có threatId hợp lệ và người dùng là manager
    if (threatId) {
      console.log(`About to fetch mitigations for threatId: ${threatId}`);
      fetchMitigations();
    }
  }, [threatId]);

  // Lấy các biện pháp giảm thiểu cho mối đe dọa hiện tại
  const fetchMitigations = async () => {
    if (!threatId || typeof threatId !== 'string') {
      console.log('Cannot fetch mitigations: Invalid or missing threatId');
      return;
    }
    
    try {
      setIsLoadingMitigations(true);
      const response = await getMitigationsForThreat(threatId);
      setMitigations(response.data || []);
    } catch (error) {
      console.error('Error fetching mitigations:', error);
      enqueueSnackbar('Failed to load mitigations', { variant: 'error' });
    } finally {
      setIsLoadingMitigations(false);
    }
  };

  // Xử lý tạo biện pháp giảm thiểu mới
  const handleCreateMitigation = async (formData: { title: string; description: string; implementation: string }) => {
    if (!threatId) return;
    
    try {
      const response = await createMitigation({
        ...formData,
        threatId
      });
      
      // Xử lý cấu trúc response đúng cách và thêm kiểm tra type
      const mitigation = response?.data?.mitigation || response?.data;
      
      if (mitigation && ('title' in mitigation)) {
        setMitigations(prev => [...prev, mitigation]);
        setOpenNewMitigationDialog(false);
        enqueueSnackbar('Mitigation created successfully', { variant: 'success' });
      } else {
        console.error('Invalid response format:', response);
        enqueueSnackbar('Invalid response from server', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error creating mitigation:', error);
      enqueueSnackbar('Failed to create mitigation', { variant: 'error' });
    }
  };

  // Xử lý cập nhật biện pháp giảm thiểu hiện có
  const handleUpdateMitigation = async (formData: { title: string; description: string; implementation: string }) => {
    if (!currentMitigation) return;
    
    try {
      const response = await updateMitigation(currentMitigation._id, formData);
      
      // Fix: Cấu trúc response đến trực tiếp trong thuộc tính data, không phải data.mitigation
      const updatedMitigation = response.data;
      
      setMitigations(prev => 
        prev.map(m => m._id === currentMitigation._id ? { ...updatedMitigation } as Mitigation : m)
      );
      setOpenEditMitigationDialog(false);
      enqueueSnackbar('Mitigation updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating mitigation:', error);
      enqueueSnackbar('Failed to update mitigation', { variant: 'error' });
    }
  };

  // Xử lý xóa biện pháp giảm thiểu
  const handleDeleteMitigation = async (mitigationId: string) => {
    if (!threatId) return;
    
    if (!window.confirm('Are you sure you want to delete this mitigation? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteMitigation(mitigationId, threatId);
      
      setMitigations(prev => prev.filter(m => m._id !== mitigationId));
      enqueueSnackbar('Mitigation deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting mitigation:', error);
      enqueueSnackbar('Failed to delete mitigation', { variant: 'error' });
    }
  };

  // Hàm xử lý lấy các đề xuất sửa chữa
  const handleGetSuggestedFixes = async () => {
    try {
      const response = await getSuggestedFixes(threatId);
      setSuggestedFixes(response.data);
      setOpenFixDialog(true);
    } catch (err) {
      console.error('Error getting suggested fixes:', err);
    }
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading threat information...
        </Typography>
      </Box>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 3,
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error loading threat information
        </Typography>
        <Typography color="text.secondary" paragraph>
          {error.message}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          size="large"
        >
          Go back
        </Button>
      </Box>
    );
  }

  // Hiển thị thông báo khi không có dữ liệu mối đe dọa
  if (!threat || !detailedInfo) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 3,
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Threat information not available
        </Typography>
        <Typography color="text.secondary" paragraph>
          The requested threat data could not be found or is incomplete.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          size="large"
        >
          Go back
        </Button>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Box 
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.02),
          pb: 6
        }}
      >
        <Container maxWidth="xl">
          {/* Header with threat name and basic info */}
          <ThreatPageHeader 
            threat={threat} 
            onSuggestFix={handleGetSuggestedFixes}
          />
          
          {/* Main content area */}
          <Grid container spacing={3}>
            {/* Left column - Primary content (Vertical layout) */}
            <Grid item xs={12} lg={8}>
              {/* Section 1: Description */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  background: `${alpha(theme.palette.background.paper, 0.8)}`,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0px 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 2 }}>
                    <Security />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Description
                  </Typography>
                </Box>
                
                {/* Added collapsible description with View More/Hide button */}
                {threat.description ? (
                  <React.Fragment>
                    <Box 
                      sx={{ 
                        position: 'relative',
                        overflow: 'hidden',
                        maxHeight: expanded ? 'none' : '100px',
                        transition: 'max-height 0.3s ease'
                      }}
                    >
                      <Typography variant="body1" paragraph>
                        {threat.description}
                      </Typography>
                      {!expanded && threat.description.length > 300 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '50px',
                            background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                          }}
                        />
                      )}
                    </Box>
                    {threat.description.length > 300 && (
                      <Button
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                        sx={{ mt: 1, color: theme.palette.primary.main }}
                      >
                        {expanded ? "Hide" : "View More"}
                      </Button>
                    )}
                  </React.Fragment>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No description available for this threat.
                  </Typography>
                )}
              </Paper>

              {/* Section 2: Related Vulnerability */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  background: `${alpha(theme.palette.background.paper, 0.8)}`,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0px 4px 20px ${alpha(theme.palette.warning.main, 0.1)}`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mr: 2 }}>
                    <BugReport />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Related Vulnerability
                  </Typography>
                </Box>
                
                {detailedInfo.relatedVulnerability ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          CVE ID
                        </Typography>
                        <Tooltip title="Click to view details on the National Vulnerability Database (NVD)">
                          <Typography 
                            variant="body1" 
                            fontWeight="medium" 
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1), 
                              px: 1.5, 
                              py: 0.5, 
                              borderRadius: 1, 
                              display: 'inline-block',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              }
                            }}
                            onClick={() => {
                              const cveId = detailedInfo.relatedVulnerability.cveId;
                              if (cveId && cveId !== 'N/A') {
                                window.open(`https://nvd.nist.gov/vuln/detail/${cveId}`, '_blank');
                              }
                            }}
                          >
                            {detailedInfo.relatedVulnerability.cveId || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </Box>
                    
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          CVSS Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={detailedInfo.relatedVulnerability.score || 'N/A'} 
                            color={
                              detailedInfo.relatedVulnerability.score >= 9 ? 'error' :
                              detailedInfo.relatedVulnerability.score >= 7 ? 'warning' :
                              detailedInfo.relatedVulnerability.score >= 4 ? 'info' : 'success'
                            }
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {detailedInfo.relatedVulnerability.severity || 'Unknown'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        CWE IDs
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {detailedInfo.relatedVulnerability.cwes && detailedInfo.relatedVulnerability.cwes.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                            {detailedInfo.relatedVulnerability.cwes.map((cwe: string, index: number) => {
                              // Extract CWE number from the format "CWE-123"
                              const cweNumber = cwe.match(/\d+/);
                              const cweLink = cweNumber 
                                ? `https://cwe.mitre.org/data/definitions/${cweNumber[0]}.html` 
                                : 'https://cwe.mitre.org/';
                              
                              return (
                                <Tooltip title={`Click to view details about ${cwe} on the MITRE CWE database`} key={index}>
                                  <Chip
                                    label={cwe}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      borderRadius: '4px', 
                                      mb: 0.5,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        borderColor: theme.palette.warning.main,
                                      }
                                    }}
                                    onClick={() => window.open(cweLink, '_blank')}
                                  />
                                </Tooltip>
                              );
                            })}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No CWE information available</Typography>
                        )}
                      </Box>
                      
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        CVSS Vector
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {detailedInfo.relatedVulnerability.cvssVector || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No related vulnerability information available.
                  </Typography>
                )}
              </Paper>

              {/* Section 3: Mitigations (only visible for managers) */}
              {isExpert && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    background: `${alpha(theme.palette.background.paper, 0.8)}`,
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: `0px 4px 20px ${alpha(theme.palette.success.main, 0.1)}`,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mr: 2 }}>
                        <Shield />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Mitigations
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setCurrentMitigation(null);
                        setOpenNewMitigationDialog(true);
                      }}
                      size="small"
                    >
                      Add Mitigation
                    </Button>
                  </Box>
                  
                  {isLoadingMitigations ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : mitigations.length > 0 ? (
                    <Grid container spacing={2}>
                      {mitigations.map((mitigation) => (
                        <Grid item xs={12} key={mitigation._id}>
                          <Card 
                            sx={{ 
                              border: `1px solid ${theme.palette.divider}`,
                              boxShadow: 'none',
                              '&:hover': {
                                boxShadow: `0px 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                              }
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h6" gutterBottom>
                                  {mitigation.title}
                                </Typography>
                                <Box>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => {
                                      setCurrentMitigation(mitigation);
                                      setOpenEditMitigationDialog(true);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteMitigation(mitigation._id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {mitigation.description}
                              </Typography>
                              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                Implementation:
                              </Typography>
                              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {mitigation.createdBy && typeof mitigation.createdBy === 'object' && mitigation.createdBy.name ? (
                                  <Typography variant="caption" color="text.secondary">
                                    Created by: {mitigation.createdBy.name}
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    Created: {new Date(mitigation.createdAt).toLocaleDateString()}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  Last updated: {new Date(mitigation.updatedAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                      <Typography variant="body1" color="text.secondary">
                        No mitigations have been added yet. 
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Click "Add Mitigation" to create the first mitigation strategy for this threat.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}

              {/* Section 4: DREAD Score Components */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  background: `${alpha(theme.palette.background.paper, 0.8)}`,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0px 4px 20px ${alpha(theme.palette.info.main, 0.1)}`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, mr: 2 }}>
                    <ScoreboardOutlined />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    DREAD Score Components
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {/* Total score indicator */}
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.7)} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
                        color: 'white',
                        height: '100%',  // Make it full height to match components
                      }}
                    >
                      <Typography variant="overline" fontWeight="medium" sx={{ opacity: 0.9 }}>
                        TOTAL SCORE
                      </Typography>
                      <Typography variant="h2" fontWeight="bold" sx={{ my: 0.5 }}>
                        {threat.score?.total || "N/A"}
                      </Typography>
                      <Chip 
                        label={
                          threat.score?.total >= 4 ? 'Critical Risk' : 
                          threat.score?.total >= 3 ? 'High Risk' : 
                          threat.score?.total >= 2 ? 'Medium Risk' : 'Low Risk'
                        }
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white', 
                          fontWeight: 'medium',
                          backdropFilter: 'blur(5px)'
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  {/* Score components - compact visualization */}
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flex: 1 }}>
                        {Object.entries(threat.score?.details || {})
                          .filter(([key]) => key !== '_id' && key !== 'id')
                          .map(([key, value]) => {
                            const scoreValue = Number(value) || 0;
                            const label = key.charAt(0).toUpperCase() + key.slice(1);
                            
                            // Get color based on score value
                            const getScoreColor = (score: number) => {
                              if (score >= 4) return theme.palette.error.main;
                              if (score >= 3) return theme.palette.warning.main;
                              if (score >= 2) return theme.palette.info.main;
                              return theme.palette.success.main;
                            };
                            
                            const scoreColor = getScoreColor(scoreValue);
                            
                            return (
                              <Box key={key} sx={{ mb: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight="medium">{label}</Typography>
                                  <Box 
                                    sx={{ 
                                      height: 20, 
                                      width: 20, 
                                      borderRadius: '50%', 
                                      bgcolor: scoreColor,
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {scoreValue}
                                  </Box>
                                </Box>
                                <Box sx={{ position: 'relative', height: 4, bgcolor: alpha(scoreColor, 0.15), borderRadius: 2 }}>
                                  <Box 
                                    sx={{ 
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      height: '100%',
                                      width: `${(scoreValue / 5) * 100}%`,
                                      bgcolor: scoreColor,
                                      borderRadius: 2
                                    }} 
                                  />
                                </Box>
                              </Box>
                            );
                          })}
                      </Box>
                      
                      {/* Minimalist DREAD explanation */}
                      <Box 
                        sx={{ 
                          mt: 'auto',
                          p: 1.5, 
                          borderRadius: 1, 
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                          fontSize: '0.8rem',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          <strong>DREAD</strong> evaluates: Damage potential, Reproducibility, Exploitability, Affected users, and Discoverability (0-5 scale)
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Section 5: Context & Background */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  background: `${alpha(theme.palette.background.paper, 0.8)}`,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0px 4px 20px ${alpha(theme.palette.success.main, 0.1)}`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mr: 2 }}>
                    <InfoOutlined />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Context & Background
                  </Typography>
                </Box>
                
                {detailedInfo.threatContext ? (
                  <Box>
                    <Typography variant="body1" paragraph>
                      {detailedInfo.threatContext.description}
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Common Attack Vectors */}
                      <Grid item xs={12} md={6}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.warning.main, 0.05),
                            border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                            height: '100%'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.warning.main, display: 'flex', alignItems: 'center' }}>
                            <WarningAmberOutlined sx={{ mr: 1, fontSize: '1.2rem' }} />
                            Common Attack Vectors
                          </Typography>
                          <List dense disablePadding>
                            {detailedInfo.threatContext.commonAttackVectors && 
                              detailedInfo.threatContext.commonAttackVectors.length > 0 ? (
                              detailedInfo.threatContext.commonAttackVectors.map((vector: any, index: number) => (
                                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <ArrowRightAlt color="warning" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={
                                      <Link
                                        href={vector.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        underline="hover"
                                        sx={{ 
                                          color: 'inherit', 
                                          '&:hover': { color: theme.palette.warning.main }
                                        }}
                                        variant="body2"
                                      >
                                        {vector.text}
                                      </Link>
                                    }
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No attack vector information available.
                              </Typography>
                            )}
                          </List>
                        </Box>
                      </Grid>
                      
                      {/* Security Principles */}
                      <Grid item xs={12} md={6}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.success.main, 0.05),
                            border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                            height: '100%'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.success.main, display: 'flex', alignItems: 'center' }}>
                            <SettingsOutlined sx={{ mr: 1, fontSize: '1.2rem' }} />
                            Security Principles
                          </Typography>
                          <List dense disablePadding>
                            {detailedInfo.threatContext.securityPrinciples && 
                              detailedInfo.threatContext.securityPrinciples.length > 0 ? (
                              detailedInfo.threatContext.securityPrinciples.map((principle: any, index: number) => (
                                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <ArrowRightAlt color="success" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={
                                      <Link
                                        href={principle.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        underline="hover"
                                        sx={{ 
                                          color: 'inherit', 
                                          '&:hover': { color: theme.palette.success.main }
                                        }}
                                        variant="body2"
                                      >
                                        {principle.text}
                                      </Link>
                                    }
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No security principles information available.
                              </Typography>
                            )}
                          </List>
                        </Box>
                      </Grid>
                      
                      {/* Affected Assets */}
                      <Grid item xs={12} md={6}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                            height: '100%'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                            <Security sx={{ mr: 1, fontSize: '1.2rem' }} />
                            Affected Assets
                          </Typography>
                          <List dense disablePadding>
                            {detailedInfo.riskAssessment?.affectedAssets && 
                              detailedInfo.riskAssessment.affectedAssets.length > 0 ? (
                              detailedInfo.riskAssessment.affectedAssets.map((asset: string, index: number) => (
                                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <ArrowRightAlt color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={asset} 
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No affected assets information available.
                              </Typography>
                            )}
                          </List>
                        </Box>
                      </Grid>
                      
                      {/* Potential Impacts */}
                      <Grid item xs={12} md={6}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                            border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`,
                            height: '100%'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.error.main, display: 'flex', alignItems: 'center' }}>
                            <Dangerous sx={{ mr: 1, fontSize: '1.2rem' }} />
                            Potential Impacts
                          </Typography>
                          <List dense disablePadding>
                            {detailedInfo.riskAssessment?.potentialImpacts && 
                              detailedInfo.riskAssessment.potentialImpacts.length > 0 ? (
                              detailedInfo.riskAssessment.potentialImpacts.map((impact: string, index: number) => (
                                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <ArrowRightAlt color="error" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={impact} 
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No potential impacts information available.
                              </Typography>
                            )}
                          </List>
                        </Box>
                      </Grid>
                      
                      {/* Official Sources/References */}
                      {detailedInfo.threatContext.officialSources && 
                        detailedInfo.threatContext.officialSources.length > 0 && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>Official References</Typography>
                          <List dense>
                            {detailedInfo.threatContext.officialSources.map((source: any, index: number) => (
                              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                  <Avatar sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                    <InfoOutlined fontSize="small" />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={
                                    <a 
                                      href={source.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      style={{ 
                                        color: theme.palette.primary.main,
                                        textDecoration: 'none'
                                      }}
                                    >
                                      {source.name}
                                    </a>
                                  }
                                  secondary={source.description}
                                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                  secondaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No threat context information available.
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Right column - "Need Mitigation Help?" section (unchanged) */}
            <Grid item xs={12} lg={4}>
              <SuggestFixCard onSuggestFix={handleGetSuggestedFixes} />
            </Grid>
          </Grid>
        </Container>
        
        {/* Dialog for showing suggested fixes */}
        <SuggestedFixesDialog
          open={openFixDialog}
          onClose={() => setOpenFixDialog(false)}
          suggestedFixes={suggestedFixes}
          userMitigations={mitigations}
        />

        {/* New Mitigation Dialog */}
        <Dialog open={openNewMitigationDialog} onClose={() => setOpenNewMitigationDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Add New Mitigation</Typography>
              <IconButton onClick={() => setOpenNewMitigationDialog(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <MitigationForm 
              onSubmit={handleCreateMitigation} 
              onCancel={() => setOpenNewMitigationDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Mitigation Dialog */}
        <Dialog open={openEditMitigationDialog} onClose={() => setOpenEditMitigationDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Edit Mitigation</Typography>
              <IconButton onClick={() => setOpenEditMitigationDialog(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {currentMitigation && (
              <MitigationForm 
                initialData={currentMitigation}
                onSubmit={handleUpdateMitigation} 
                onCancel={() => setOpenEditMitigationDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
}