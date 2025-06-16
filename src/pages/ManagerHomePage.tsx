import React from 'react';
import {
  Box,
  Container,
  Grid,
  Toolbar,
  Paper,
  Typography,
  useTheme,
  alpha,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Button
} from "@mui/material";
import {
  Dashboard,
  Business,
  CalendarToday,
  AccessTime,
  Timeline,
  ArticleOutlined,
  BugReport,
  Security,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  VerifiedUser
} from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import Chart from "~/components/charts/ActivityHistoryChart";
import { useActivityHistoryQuery } from "~/hooks/fetching/history/query";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";
import { useTasksQuery } from "~/hooks/fetching/task/query";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";
import { useArtifactsQuery } from "~/hooks/fetching/artifact/query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUserByAccountIdQuery } from '~/hooks/fetching/user/query';
import ProjectSelector from "~/components/layout-components/ProjectSelector";
import ArtifactsSection from "~/components/layout-components/ArtifactsSection";
import { useProjectWorkflowStatsQuery, useArtifactsByWorkflowStepQuery } from '~/hooks/fetching/workflow/query';
import { WorkflowStats } from '~/hooks/fetching/workflow';

// Extend dayjs with relative time
dayjs.extend(relativeTime);

export default function ManagerHomePage() {
  const { currentProject } = useParams();
  const actHistQuery = useActivityHistoryQuery(currentProject);
  const actHist = actHistQuery.data?.data;
  const projectInfoQuery = useProjectInfoQuery(currentProject);
  const projectInfo = projectInfoQuery.data?.data;
  const tasksQuery = useTasksQuery(currentProject || '');
  const tasks = tasksQuery.data?.data || [];
  const ticketsQuery = useTicketsQuery(currentProject || '');
  const tickets = ticketsQuery.data?.data || [];
  const theme = useTheme();
  const userQuery = useUserByAccountIdQuery();
  const user = userQuery.data?.data;
  
  // Get workflow statistics
  const { 
    data: workflowStatsData, 
    isLoading: isLoadingWorkflowStats 
  } = useProjectWorkflowStatsQuery(currentProject || '');
  const workflowStats: WorkflowStats | null | undefined = workflowStatsData?.data;
  
  // Get artifacts in the current workflow step
  const { 
    data: artifactsInProgressData 
  } = useArtifactsByWorkflowStepQuery(currentProject || '', undefined);

  // If data is not loaded yet
  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (!actHist) return <></>;

  // Get stats from activity history
  const commits = actHist.filter((x) => x.action === "commit");
  const pullRequests = actHist.filter((x) => x.action === "pr");

  // Calculate task statistics
  const activeTasks = tasks.filter(task => task.status === "active").length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate ticket statistics
  const notAcceptedTickets = tickets.filter(t => t.status === "Not accepted").length;
  const processingTickets = tickets.filter(t => t.status === "Processing").length;
  const submittedTickets = tickets.filter(t => t.status === "Submitted").length;
  const resolvedTickets = tickets.filter(t => t.status === "Resolved").length;
  const totalTickets = tickets.length;
  const ticketResolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: "100vh",
      width: "100%",
      overflow: "auto",
      bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.04),
    }}>
      <Toolbar />
      <Container sx={{ py: 3 }} maxWidth="xl">
        <Typography variant="h3" fontWeight="bold" sx={{ mb: 3 }}>
          Welcome back, {user.name}!
        </Typography>

        {/* Project Selector */}
        <ProjectSelector />

        {/* User Welcome and Stats */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: 80, md: 150 },
              height: '100%',
              opacity: 0.05,
              display: { xs: 'none', md: 'block' }
            }}
          >
            <Dashboard sx={{ fontSize: 180, position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)' }} />
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              Overview
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <Typography variant="body2" color="text.secondary">Total Commits</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.primary.main, my: 0.5 }}>
                    {commits.length}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                }}>
                  <Typography variant="body2" color="text.secondary">Pull Requests</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.info.main, my: 0.5 }}>
                    {pullRequests.length}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Project Artifacts */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Project Artifacts
            </Typography>
            
          </Box>
          
          {/* Artifacts Grid Section */}
          <ArtifactsSection currentProject={currentProject || ''} />
        </Paper>

        {/* Recent Activity */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            mb: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            p: 3
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Activity
          </Typography>

          {(actHist && actHist.length > 0) ? (
            <List disablePadding>
              {actHist.slice(0, 5).map((activity, index) => (
                <React.Fragment key={activity._id || index}>
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main
                        }}
                      >
                        <Timeline />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="medium">
                          {activity.content}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            by {activity.createdBy}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            <AccessTime fontSize="inherit" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                            {activity.createdAt ? dayjs(activity.createdAt).fromNow() : 'Date unknown'}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={activity.action === "commit" ? "Commit" : "Pull Request"}
                      size="small"
                      sx={{
                        bgcolor: alpha(activity.action === "commit" ? theme.palette.primary.main : theme.palette.info.main, 0.1),
                        color: activity.action === "commit" ? theme.palette.primary.main : theme.palette.info.main,
                        fontWeight: 'medium'
                      }}
                    />
                  </ListItem>
                  {index < Math.min(actHist.length, 5) - 1 && <Divider sx={{ my: 0.5 }} />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{
              py: 4,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
            }}>
              <Timeline sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No recent activity to display
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Activity History Chart */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            mb: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            p: 3
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Activity History
          </Typography>
          <Chart activityHistory={actHist} />
        </Paper>
        {/* Project Overview - Full Width Task Statistics */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Task Statistics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <Typography variant="body2" color="text.secondary">Active Tasks</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
                  {activeTasks}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}>
                <Typography variant="body2" color="text.secondary">Completed Tasks</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.success.main }}>
                  {completedTasks}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Completion Progress</Typography>
              <Typography variant="body2" fontWeight="medium">{taskCompletionRate}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={taskCompletionRate}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.primary.main
                }
              }}
            />
          </Box>
        </Paper>

        {/* Full Width Ticket Statistics */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Ticket Statistics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.05),
                border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`
              }}>
                <Typography variant="body2" color="text.secondary" noWrap>Not Accepted</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.grey[600] }}>
                  {notAcceptedTickets}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
              }}>
                <Typography variant="body2" color="text.secondary" noWrap>Processing</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.warning.main }}>
                  {processingTickets}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
              }}>
                <Typography variant="body2" color="text.secondary" noWrap>Submitted</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.info.main }}>
                  {submittedTickets}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}>
                <Typography variant="body2" color="text.secondary" noWrap>Resolved</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.success.main }}>
                  {resolvedTickets}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Resolution Progress</Typography>
              <Typography variant="body2" fontWeight="medium">{ticketResolutionRate}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={ticketResolutionRate}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.success.main
                }
              }}
            />
          </Box>
        </Paper>        {/* Workflow Analytics */}

      </Container>
    </Box>
  );
}

// Helper component for workflow step chips
interface WorkflowStepChipProps {
  label: string;
  count: number;
  color: string;
  icon: React.ReactElement;
}

const WorkflowStepChip: React.FC<WorkflowStepChipProps> = ({ label, count, color, icon }) => {
  return (
    <Chip 
      icon={icon}
      label={
        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
          {label}
          <Box 
            component="span" 
            sx={{ 
              ml: 0.5,
              bgcolor: 'background.paper',
              color,
              px: 0.75,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            {count}
          </Box>
        </Box>
      }
      sx={{ 
        bgcolor: alpha(color, 0.1),
        color,
        border: `1px solid ${alpha(color, 0.2)}`,
        '& .MuiChip-icon': {
          color: 'inherit'
        }
      }}
    />
  );
};

// Helper function to get color based on workflow step
function getWorkflowStepColor(step: number): "primary" | "info" | "secondary" | "warning" | "success" {
  switch (step) {
    case 1: return "primary"; // Detection
    case 2: return "info";    // Classification
    case 3: return "secondary"; // Assignment
    case 4: return "warning"; // Remediation
    case 5: return "success"; // Verification
    default: return "primary";
  }
}
