import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Chip,
  Divider, 
  Grid, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Check as CheckIcon, 
  Error as ErrorIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  VerifiedUser as VerifiedUserIcon,
  Schedule as ScheduleIcon,
  Loop as LoopIcon
} from '@mui/icons-material';
import { WorkflowCycle } from '~/hooks/fetching/workflow';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Icons for each workflow step
const StepIcons = [
  <SearchIcon color="primary" />,         // Detection
  <SecurityIcon color="info" />,          // Classification
  <AssignmentIcon color="secondary" />,   // Assignment
  <BuildIcon color="warning" />,          // Remediation
  <VerifiedUserIcon color="success" />    // Verification
];

// Step labels
const StepLabels = [
  "Detection", 
  "Classification", 
  "Assignment", 
  "Remediation", 
  "Verification"
];

interface WorkflowPanelProps {
  workflowCycles: WorkflowCycle[];
  isLoading: boolean;
  error: any;
}

const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ workflowCycles, isLoading, error }) => {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
    if (error) {
    console.error("WorkflowPanel error:", error);
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error.main" gutterBottom>Error loading workflow data</Typography>
        <Typography variant="body2" color="text.secondary">
          The server might be still initializing workflow tracking. Please try again later.
        </Typography>
      </Box>
    );
  }
    if (!workflowCycles || workflowCycles.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No workflow data available yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Workflow tracking will initialize after security scans are completed.
          Once workflow data is available, you'll see the progress of this artifact through the security process.
        </Typography>
      </Box>
    );
  }
  
  // Sort cycles by cycleNumber to ensure they are in order
  const sortedCycles = [...workflowCycles].sort((a, b) => a.cycleNumber - b.cycleNumber);
  
  // Get the latest cycle
  const latestCycle = sortedCycles[sortedCycles.length - 1];
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LoopIcon sx={{ mr: 1 }} /> Workflow Progress
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Typography variant="subtitle1">
            Current Cycle: {latestCycle.cycleNumber}
          </Typography>
          <Chip 
            size="small" 
            label={latestCycle.completedAt ? 'Completed' : 'In Progress'}
            color={latestCycle.completedAt ? 'success' : 'primary'}
            variant="outlined"
          />
        </Stack>
        
        <Stepper activeStep={latestCycle.currentStep - 1} orientation="vertical">
          {[0, 1, 2, 3, 4].map((stepIndex) => {
            const stepNum = stepIndex + 1;
            const stepKey = StepLabels[stepIndex].toLowerCase();
            const stepData = latestCycle[stepKey as keyof WorkflowCycle];
            const isCompleted = stepNum < latestCycle.currentStep;
            const isActive = stepNum === latestCycle.currentStep;
            
            return (
              <Step key={stepIndex} completed={isCompleted}>
                <StepLabel
                  icon={
                    <Box sx={{ 
                      bgcolor: isCompleted || isActive ? 
                        alpha(theme.palette.primary.main, 0.1) : 
                        'transparent',
                      p: 1,
                      borderRadius: '50%'
                    }}>
                      {StepIcons[stepIndex]}
                    </Box>
                  }
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {StepLabels[stepIndex]}
                    {stepData && typeof stepData === 'object' && 'completedAt' in stepData && stepData.completedAt && (
                      <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                        (Completed {dayjs(stepData.completedAt).fromNow()})
                      </Typography>
                    )}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {stepNum === 1 && stepData && ( // Detection
                      <StepDetails
                        title="Vulnerabilities Detected"
                        count={(stepData as any)?.numberVuls || 0}
                        icon={<BugReportIcon fontSize="small" />}
                      />
                    )}
                    
                    {stepNum === 2 && stepData && ( // Classification
                      <StepDetails
                        title="Threats Identified"
                        count={(stepData as any)?.numberThreats || 0}
                        icon={<SecurityIcon fontSize="small" />}
                      />
                    )}
                    
                    {stepNum === 3 && stepData && ( // Assignment
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <StepDetails
                            title="Tickets Assigned"
                            count={(stepData as any)?.numberTicketsAssigned || 0}
                            icon={<CheckIcon fontSize="small" color="success" />}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <StepDetails
                            title="Tickets Unassigned"
                            count={(stepData as any)?.numberTicketsNotAssigned || 0}
                            icon={<ErrorIcon fontSize="small" color="error" />}
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    {stepNum === 4 && stepData && ( // Remediation
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <StepDetails
                            title="Tickets Submitted"
                            count={(stepData as any)?.numberTicketsSubmitted || 0}
                            icon={<CheckIcon fontSize="small" color="success" />}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <StepDetails
                            title="Tickets Not Submitted"
                            count={(stepData as any)?.numberTicketsNotSubmitted || 0}
                            icon={<ErrorIcon fontSize="small" color="error" />}
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    {stepNum === 5 && stepData && ( // Verification
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <StepDetails
                            title="Tickets Resolved"
                            count={(stepData as any)?.numberTicketsResolved || 0}
                            icon={<CheckIcon fontSize="small" color="success" />}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <StepDetails
                            title="Tickets Returned"
                            count={(stepData as any)?.numberTicketsReturnedToProcessing || 0}
                            icon={<LoopIcon fontSize="small" color="warning" />}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Box>
      
      {workflowCycles.length > 1 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Workflow History</Typography>
          
          <List disablePadding>
            {sortedCycles.slice(0, -1).reverse().map((cycle) => (
              <ListItem
                key={cycle.cycleNumber}
                divider
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">
                        Cycle #{cycle.cycleNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Tooltip title={dayjs(cycle.startedAt).format('YYYY-MM-DD HH:mm')}>
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                            {dayjs(cycle.startedAt).fromNow()}
                          </Box>
                        </Tooltip>
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Tooltip title="Vulnerabilities detected">
                            <Chip 
                              size="small" 
                              icon={<BugReportIcon />} 
                              label={cycle.detection?.numberVuls || 0}
                              variant="outlined"
                            />
                          </Tooltip>
                        </Grid>
                        <Grid item xs={4}>
                          <Tooltip title="Threats classified">
                            <Chip 
                              size="small" 
                              icon={<SecurityIcon />} 
                              label={cycle.classification?.numberThreats || 0}
                              variant="outlined"
                            />
                          </Tooltip>
                        </Grid>
                        <Grid item xs={4}>
                          <Tooltip title="Tickets returned to processing">
                            <Chip 
                              size="small" 
                              icon={<LoopIcon />} 
                              label={cycle.verification?.numberTicketsReturnedToProcessing || 0}
                              variant="outlined"
                              color="warning"
                            />
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

// Helper component for step details
interface StepDetailsProps {
  title: string;
  count: number;
  icon: React.ReactNode;
}

const StepDetails: React.FC<StepDetailsProps> = ({ title, count, icon }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="body2">
        {title}: <strong>{count}</strong>
      </Typography>
    </Box>
  );
};

export default WorkflowPanel;
