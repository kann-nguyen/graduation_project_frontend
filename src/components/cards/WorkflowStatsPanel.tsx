import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  alpha,
  CircularProgress,
  Grid
} from '@mui/material';
import { Timeline, TimelineItem, TimelineOppositeContent, TimelineSeparator, TimelineConnector, TimelineDot, TimelineContent } from '@mui/lab';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Loop as LoopIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { WorkflowStats } from '~/hooks/fetching/workflow';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface WorkflowStatsPanelProps {
  workflowStats: WorkflowStats;
  isLoading: boolean;
  error: any;
}

const WorkflowStatsPanel: React.FC<WorkflowStatsPanelProps> = ({ workflowStats, isLoading, error }) => {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
    if (error) {
    console.error("WorkflowStatsPanel error:", error);
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error.main" gutterBottom>Error loading workflow statistics</Typography>
        <Typography variant="body2" color="text.secondary">
          The server might be still initializing workflow tracking. Please try again later.
        </Typography>
      </Box>
    );
  }
  
  if (!workflowStats) {
    return (      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
          <AnalyticsIcon sx={{ mr: 1 }} /> Workflow Statistics
        </Typography>
        <Typography color="text.secondary">
          No workflow statistics available yet. This data will appear once workflow tracking is initialized.
        </Typography>
      </Paper>
    );
  }
  
  // Data for the pie chart showing artifacts by step
  const stepDistributionData = [
    { name: 'Detection', value: workflowStats.step1Count, color: theme.palette.primary.main },
    { name: 'Classification', value: workflowStats.step2Count, color: theme.palette.info.main },
    { name: 'Assignment', value: workflowStats.step3Count, color: theme.palette.secondary.main },
    { name: 'Remediation', value: workflowStats.step4Count, color: theme.palette.warning.main },
    { name: 'Verification', value: workflowStats.step5Count, color: theme.palette.success.main },
  ];
  
  // Data for the pie chart showing completed vs in progress artifacts
  const completionStatusData = [
    { name: 'Completed', value: workflowStats.completedArtifacts, color: theme.palette.success.main },
    { 
      name: 'In Progress', 
      value: workflowStats.totalArtifacts - workflowStats.completedArtifacts, 
      color: theme.palette.info.main 
    },
  ];
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AnalyticsIcon sx={{ mr: 1 }} /> Workflow Statistics
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Artifact Status Distribution
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stepDistributionData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stepDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} artifacts`, 'Count']}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Completion Status
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionStatusData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {completionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} artifacts`, 'Count']}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
          Key Metrics
        </Typography>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
        }}>
          <Grid container spacing={2}>
            <MetricItem 
              title="Total Artifacts"
              value={workflowStats.totalArtifacts}
            />
            <MetricItem 
              title="Completed Artifacts"
              value={workflowStats.completedArtifacts}
              color="success.main"
            />
            <MetricItem 
              title="Average Cycles"
              value={workflowStats.averageCycles.toFixed(1)}
              color="info.main"
            />
            <MetricItem 
              title="Total Workflow Cycles"
              value={workflowStats.totalCycles}
              color="secondary.main"
            />
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

interface MetricItemProps {
  title: string;
  value: string | number;
  color?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ title, value, color = 'text.primary' }) => {
  return (
    <Grid item xs={6} sm={3}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="medium" color={color}>
        {value}
      </Typography>
    </Grid>
  );
};

export default WorkflowStatsPanel;
