import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectWorkflowStatsQuery, useArtifactsByWorkflowStepQuery } from '~/hooks/fetching/workflow/query';
import WorkflowStatsPanel from '~/components/workflow/WorkflowStatsPanel';
import { WorkflowStats } from '~/hooks/fetching/workflow';

export default function ProjectWorkflowPage() {
  const { currentProject } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
    // Get workflow statistics for project
  const { 
    data: workflowStatsData, 
    isLoading: isLoadingStats, 
    error: statsError,
    refetch: refetchStats
  } = useProjectWorkflowStatsQuery(currentProject || '');
  
  // Get artifacts by current workflow step
  const { 
    data: artifactsData, 
    isLoading: isLoadingArtifacts, 
    error: artifactsError,
    refetch: refetchArtifacts
  } = useArtifactsByWorkflowStepQuery(currentProject || '', tabValue === 0 ? undefined : tabValue);
  
  // Log errors for debugging
  React.useEffect(() => {
    if (statsError) {
      console.error("Error loading workflow stats:", statsError);
    }
    if (artifactsError) {
      console.error("Error loading artifacts by step:", artifactsError);
    }
    
    if (workflowStatsData) {
      console.log("Workflow stats received:", workflowStatsData);
    }
    if (artifactsData) {
      console.log("Artifacts by step received:", artifactsData);
    }
  }, [statsError, artifactsError, workflowStatsData, artifactsData]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.02),
      }}
    >
      <Container sx={{ py: 4 }} maxWidth="xl">
        {/* Header & Breadcrumbs */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate(`/${currentProject}`)}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {currentProject}
            </Link>
            <Typography
              sx={{ display: 'flex', alignItems: 'center' }}
              color="text.primary"
            >
              <BarChartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Workflow Analytics
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Project Workflow Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor the progress and status of security workflow across all artifacts
          </Typography>
        </Box>
        
        {/* Stats Panel */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {isLoadingStats ? (
              <WorkflowStatsPanel 
                workflowStats={{} as WorkflowStats} 
                isLoading={true} 
                error={statsError} 
              />
            ) : workflowStatsData?.data ? (
              <WorkflowStatsPanel 
                workflowStats={workflowStatsData.data} 
                isLoading={false} 
                error={statsError} 
              />
            ) : (
              <WorkflowStatsPanel 
                workflowStats={{} as WorkflowStats} 
                isLoading={false} 
                error={statsError || new Error("No data available")} 
              />
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Artifacts by Workflow Step
              </Typography>
              
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
              >
                <Tab label="All Artifacts" />
                <Tab label="1. Detection" />
                <Tab label="2. Classification" />
                <Tab label="3. Assignment" />
                <Tab label="4. Remediation" />
                <Tab label="5. Verification" />
              </Tabs>
                {isLoadingArtifacts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, flexDirection: 'column', alignItems: 'center' }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography color="text.secondary">Loading artifacts...</Typography>
                </Box>
              ) : artifactsError ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="error" gutterBottom>Error loading artifacts</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                    We encountered an issue while retrieving workflow artifacts.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => refetchArtifacts()}
                    startIcon={<RefreshIcon />}
                  >
                    Retry
                  </Button>
                </Box>
              ) : !artifactsData?.data || artifactsData?.data?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" paragraph>
                    No artifacts found in this workflow step
                  </Typography>
                  {tabValue !== 0 && (
                    <Button 
                      variant="outlined" 
                      onClick={() => setTabValue(0)}
                      size="small"
                    >
                      View All Artifacts
                    </Button>
                  )}
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {artifactsData?.data?.map((artifact: any) => (
                    <Grid item xs={12} sm={6} md={4} key={artifact._id}>
                      <Card 
                        onClick={() => navigate(`/${currentProject}/artifact/${artifact._id}`)} 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                              {artifact.name}
                            </Typography>
                            <Box 
                              sx={{ 
                                bgcolor: 
                                  artifact.currentWorkflowStep === 1 ? alpha(theme.palette.primary.main, 0.1) :
                                  artifact.currentWorkflowStep === 2 ? alpha(theme.palette.info.main, 0.1) :
                                  artifact.currentWorkflowStep === 3 ? alpha(theme.palette.secondary.main, 0.1) :
                                  artifact.currentWorkflowStep === 4 ? alpha(theme.palette.warning.main, 0.1) :
                                  alpha(theme.palette.success.main, 0.1),
                                color:
                                  artifact.currentWorkflowStep === 1 ? theme.palette.primary.main :
                                  artifact.currentWorkflowStep === 2 ? theme.palette.info.main :
                                  artifact.currentWorkflowStep === 3 ? theme.palette.secondary.main :
                                  artifact.currentWorkflowStep === 4 ? theme.palette.warning.main :
                                  theme.palette.success.main,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              Step {artifact.currentWorkflowStep || 1}
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {artifact.type}
                          </Typography>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Vulnerabilities:</Typography>
                              <Typography variant="body2">{artifact.vulnerabilityList?.length || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Threats:</Typography>
                              <Typography variant="body2">{artifact.threatList?.length || 0}</Typography>
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mt: 1 
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              Cycles: {artifact.workflowCyclesCount || 1}
                            </Typography>
                            {artifact.workflowCompleted && (
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                color: theme.palette.success.main,
                                bgcolor: alpha(theme.palette.success.light, 0.1),
                                px: 1,
                                py: 0.25,
                                borderRadius: 1
                              }}>
                                <SecurityIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="caption" fontWeight="bold">Completed</Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
