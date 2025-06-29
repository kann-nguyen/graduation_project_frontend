import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  alpha, 
  Chip, 
  Button,
  CircularProgress,
  Tooltip,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  ArticleOutlined, 
  BugReport, 
  Security,
  NavigateNext,
  Code,
  ContentPaste,
  GridView,
  LibraryBooks,
  Timeline,
  Loop as LoopIcon,
  Check as CheckIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  VerifiedUser
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useArtifactsQuery } from '~/hooks/fetching/artifact/query';
import { WorkflowCycle } from '~/hooks/fetching/workflow';
import { Docker } from '~/components/layout-components/Icons';
import { Artifact } from '~/hooks/fetching/artifact';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relative time
dayjs.extend(relativeTime);

interface ArtifactsSectionProps {
  currentProject: string;
}

const ArtifactsSection = ({ currentProject }: ArtifactsSectionProps) => {
  const theme = useTheme();
  const artifactsQuery = useArtifactsQuery(currentProject);
  
  if (artifactsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (artifactsQuery.isError) {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        bgcolor: alpha(theme.palette.error.main, 0.05),
        borderRadius: 2,
        border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`
      }}>
        <Typography color="error">
          Error loading artifacts
        </Typography>
      </Box>
    );
  }
  
  const artifacts = artifactsQuery.data?.data || [];
  
  if (artifacts.length === 0) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        borderRadius: 2,
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
      }}>
        <ArticleOutlined sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No artifacts found for this project
        </Typography>        <Button 
          component={RouterLink}
          to={`/${encodeURIComponent(currentProject)}/phases`}
          variant="outlined" 
          size="small"
          sx={{ mt: 1 }}
        >
          Go to Phases to Add Artifacts
        </Button>
      </Box>
    );
  }
  
  // Helper function to get the icon for each artifact type
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
  
  // Get the color for each artifact type
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
    // Helper function to render workflow status for an artifact
  const renderWorkflowStatus = (artifact: Artifact) => {
    // Check if artifact has workflow data
    if (!artifact.currentWorkflowStep && !artifact.workflowCycles) {
      return (
        <Box sx={{ textAlign: 'center', py: 1, bgcolor: alpha(theme.palette.grey[500], 0.1), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            No workflow data available
          </Typography>
        </Box>
      );
    }
    
    const currentStep = artifact.currentWorkflowStep || 1;
    const totalSteps = 5; // Total steps in the workflow
    const progress = (currentStep / totalSteps) * 100;
    const isCompleted = artifact.workflowCycles?.some((cycle: any) => cycle.completedAt);
    
    // Get step name and color
    const getStepInfo = (step: number) => {
      switch(step) {
        case 1: return { name: 'Detection', color: theme.palette.primary.main, icon: <BugReport fontSize="small" /> };
        case 2: return { name: 'Classification', color: theme.palette.info.main, icon: <Security fontSize="small" /> };
        case 3: return { name: 'Assignment', color: theme.palette.secondary.main, icon: <AssignmentIcon fontSize="small" /> };
        case 4: return { name: 'Remediation', color: theme.palette.warning.main, icon: <BuildIcon fontSize="small" /> };
        case 5: return { name: 'Verification', color: theme.palette.success.main, icon: <VerifiedUser fontSize="small" /> };
        default: return { name: 'Unknown', color: theme.palette.grey[500], icon: <LoopIcon fontSize="small" /> };
      }
    };
    
    const stepInfo = getStepInfo(currentStep);
    
    // Get cycle information
    const cycles = artifact.workflowCycles || [];
    const cycleCount = cycles.length;
    
    return (
      <Box>
        {/* Step Information */}        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 1 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={stepInfo.icon}
              label={`${stepInfo.name}`}
              size="small"
              sx={{
                bgcolor: alpha(stepInfo.color, 0.1),
                color: stepInfo.color,
                '& .MuiChip-icon': {
                  color: 'inherit'
                }
              }}
            />
            
            {/* {isCompleted && (
              <Chip
                icon={<CheckIcon fontSize="small" />}
                label="Completed"
                size="small"
                color="success"
                variant="outlined"
                sx={{ ml: 1, height: 24 }}
              />
            )} */}
          </Box>
          
          <Tooltip title="Workflow cycles">
            <Chip
              icon={<LoopIcon fontSize="small" />}
              label={cycleCount || 1}
              size="small"
              sx={{ height: 24 }}
            />
          </Tooltip>
        </Box>
          {/* Workflow Steps Visualization */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>          
          {[1, 2, 3, 4, 5].map((step) => {
            // Only mark as completed if step is less than currentStep or the workflow is completed
            const stepCompleted = step < currentStep;
            const isCurrentStep = step === currentStep;
            const getStepIcon = (s: number) => {
              switch(s) {
                case 1: return <BugReport fontSize="small" />;
                case 2: return <Security fontSize="small" />;
                case 3: return <AssignmentIcon fontSize="small" />;
                case 4: return <BuildIcon fontSize="small" />;
                case 5: return <VerifiedUser fontSize="small" />;
                default: return null;
              }
            };
            
            return (
              <Tooltip key={step} title={getStepInfo(step).name}>
                <Box
                  sx={{
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: stepCompleted 
                      ? alpha(theme.palette.success.main, 0.1) 
                      : isCurrentStep 
                        ? alpha(getStepInfo(step).color, 0.1) 
                        : alpha(theme.palette.grey[300], 0.5),
                    border: `2px solid ${
                      stepCompleted 
                        ? theme.palette.success.main 
                        : isCurrentStep 
                          ? getStepInfo(step).color 
                          : theme.palette.grey[300]
                    }`,
                    color: stepCompleted 
                      ? theme.palette.success.main 
                      : isCurrentStep 
                        ? getStepInfo(step).color 
                        : theme.palette.grey[500]
                  }}
                >
                  {stepCompleted ? <CheckIcon fontSize="small" /> : getStepIcon(step)}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
        
        {/* Progress Bar */}        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(currentStep - 1) * 20}
                sx={{
                  height: 4,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: isCompleted ? theme.palette.success.main : stepInfo.color,
                  }
                }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {`${Math.round((currentStep - 1) * 20)}%`}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Additional stats for specific steps */}
        {currentStep === 1 && artifact.vulnerabilityList?.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {artifact.vulnerabilityList.length} vulnerabilities detected
          </Typography>
        )}
        
        {currentStep === 2 && artifact.threatList?.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {artifact.threatList.length} threats classified
          </Typography>
        )}        {/* Step-specific information - Assignment step */}
        {currentStep === 3 && artifact.currentWorkflowCycle?.assignment?.numberTicketsAssigned && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {artifact.currentWorkflowCycle.assignment.numberTicketsAssigned} tickets assigned
          </Typography>
        )}
        
        {/* Step-specific information - Remediation step */}
        {currentStep === 4 && artifact.currentWorkflowCycle?.remediation && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {artifact.currentWorkflowCycle.remediation.numberTicketsSubmitted || 0} of {
              (artifact.currentWorkflowCycle.remediation.numberTicketsSubmitted || 0) + 
              (artifact.currentWorkflowCycle.remediation.numberTicketsNotSubmitted || 0)
            } tickets submitted
          </Typography>
        )}
        
        {/* Step-specific information - Verification step */}
        {currentStep === 5 && artifact.currentWorkflowCycle?.verification && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {artifact.currentWorkflowCycle.verification.numberTicketsResolved || 0} tickets resolved
          </Typography>
        )}
        
        {/* Display last updated date if workflow data exists */}
        {artifact.currentWorkflowCycle?.startedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
            Updated {dayjs(artifact.currentWorkflowCycle.startedAt).fromNow()}
          </Typography>
        )}
      </Box>
    );
  };
  
  return (
    <Grid container spacing={2}>
      {artifacts.map((artifact) => (
        <Grid item xs={12} sm={6} md={4} key={artifact._id}>          <Card 
            sx={{ 
              height: '100%',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              },
              position: 'relative',
              overflow: 'hidden'
            }}
          >{artifact.isScanning && (
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
            
            {artifact.state === "invalid" && (
              <Box sx={{ 
                position: 'absolute', 
                top: artifact.isScanning ? 32 : 0, 
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
            
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      bgcolor: alpha(getArtifactTypeColor(artifact.type), 0.1),
                      color: getArtifactTypeColor(artifact.type),
                      mr: 1.5
                    }}
                  >
                    {getArtifactTypeIcon(artifact.type)}
                  </Box>
                  <Box>
                    <Typography variant="h6" noWrap sx={{ maxWidth: 200 }}>
                      {artifact.name}
                    </Typography>
                    <Chip 
                      label={artifact.type}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(getArtifactTypeColor(artifact.type), 0.1),
                        color: getArtifactTypeColor(artifact.type),
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {artifact.version && (
                  <Tooltip title="Version">
                    <Chip 
                      label={`v${artifact.version}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Tooltip>
                )}
              </Box>
                {/* Security Stats */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Tooltip title="Vulnerabilities">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BugReport fontSize="small" color="error" />
                    <Typography variant="body2">
                      {artifact.vulnerabilityList?.length || 0} Vulnerabilities
                    </Typography>
                  </Box>
                </Tooltip>
                
                <Tooltip title="Threats">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Security fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {artifact.threatList?.length || 0} Threats
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
              
              {/* Workflow Status Section */}
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Timeline fontSize="small" sx={{ mr: 0.5 }} /> Workflow Status
                </Typography>
                
                {/* Display current workflow step */}
                {renderWorkflowStatus(artifact)}
              </Box>
              
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={RouterLink}
                  to={`/${encodeURIComponent(currentProject)}/artifact/${artifact._id}`}
                  endIcon={<NavigateNext />}
                  size="small"
                  variant="contained"
                  color="primary"
                >
                  Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ArtifactsSection;