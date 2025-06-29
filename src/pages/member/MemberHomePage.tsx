import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Toolbar, 
  Paper, 
  Typography,
  Divider,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardHeader,
  Button,
  Avatar,
  AvatarGroup,
  Tooltip,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  IconButton,
  Badge,
  Fade,
  Link as MuiLink
} from "@mui/material";
import { 
  Assignment, 
  BugReport, 
  TaskAlt, 
  AccessTime, 
  Person, 
  Security, 
  Dashboard, 
  StackedBarChart, 
  ArrowForward, 
  Star, 
  StarBorder, 
  MoreVert, 
  CheckCircleOutline, 
  PriorityHigh,
  CalendarToday,
  Business,
  Timeline,
  Link as LinkIcon
} from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useActivityHistoryOfUserQuery } from "~/hooks/fetching/history/query";
import { useUserByAccountIdQuery } from "~/hooks/fetching/user/query";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";
import { Task } from "~/hooks/fetching/task";
import { ActivityHistory } from "~/hooks/fetching/history";
import { Project } from "~/hooks/fetching/project";
import ProjectSelector from "~/components/layout-components/ProjectSelector";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with relative time
dayjs.extend(relativeTime);

export default function MemberHomePage() {
  const { currentProject } = useParams();
  const actHistQuery = useActivityHistoryOfUserQuery(currentProject);
  const actHistData = actHistQuery.data?.data as ActivityHistory[] | undefined;
  const userQuery = useUserByAccountIdQuery();
  const user = userQuery.data?.data;
  const projectInfoQuery = useProjectInfoQuery(currentProject);
  const projectInfo = projectInfoQuery.data?.data as Project | undefined;
  const theme = useTheme();
  
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
  
  const taskAssigned = user.taskAssigned as Task[] || [];
  const ticketAssigned = user.ticketAssigned || [];

  // Calculate task and ticket statistics
  const activeTasks = taskAssigned.filter(task => task.status === "active").length;
  const completedTasks = taskAssigned.filter(task => task.status === "completed").length;
  const processingTickets = ticketAssigned.filter(ticket => ticket.status === "Processing").length;
  const submittedTickets = ticketAssigned.filter(ticket => ticket.status === "Submitted").length;
  
  // Task completion rate
  const taskCompletionRate = taskAssigned.length > 0 
    ? Math.round((completedTasks / taskAssigned.length) * 100) 
    : 0;
  
  // Ticket resolution rate
  const ticketResolutionRate = ticketAssigned.length > 0 
    ? Math.round((submittedTickets / ticketAssigned.length) * 100) 
    : 0;
  
  // Format task priority label and color
  const getPriorityInfo = (priority?: string) => {
    switch(priority) {
      case 'high':
        return { color: theme.palette.error.main, label: 'High' };
      case 'medium':
        return { color: theme.palette.warning.main, label: 'Medium' };
      case 'low':
        return { color: theme.palette.success.main, label: 'Low' };
      default:
        return { color: theme.palette.info.main, label: 'Normal' };
    }
  };

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
        
        {/* User Stats */}
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
              Here's your task and ticket overview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Overview of your current assignments
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <Typography variant="body2" color="text.secondary">Tasks Progress</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.primary.main, my: 0.5 }}>
                    {completedTasks}/{taskAssigned.length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={taskCompletionRate} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: theme.palette.primary.main
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                    {taskCompletionRate}% Complete
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                }}>
                  <Typography variant="body2" color="text.secondary">Tickets Progress</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.error.main, my: 0.5 }}>
                    {submittedTickets}/{ticketAssigned.length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={ticketResolutionRate} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.error.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: theme.palette.error.main
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                    {ticketResolutionRate}% Submitted
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
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
          
          {(actHistData && actHistData.length > 0) ? (
            <List disablePadding>
              {actHistData.slice(0, 5).map((activity, index) => (
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
                  </ListItem>
                  {index < Math.min(actHistData.length, 5) - 1 && <Divider sx={{ my: 0.5 }} />}
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
        
        {/* Dashboard Content */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Recent Tickets */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardHeader 
                title={
                  <Typography variant="h6" fontWeight="bold">
                    Recent Tickets
                  </Typography>
                } 
                action={
                  <Button 
                    component={RouterLink}
                    to={`/${encodeURIComponent(currentProject || '')}/tickets`}
                    endIcon={<ArrowForward />}
                    size="small"
                  >
                    View All
                  </Button>
                }
              />
              <CardContent>
                {ticketAssigned.length > 0 ? (
                  <List disablePadding>
                    {ticketAssigned.slice(0, 4).map((ticket, index) => {
                      // Map ticket status to colors
                      let statusColor;
                      let statusBgColor;
                      let icon;
                      
                      switch(ticket.status) {
                        case 'Not accepted':
                          statusColor = theme.palette.error.main;
                          statusBgColor = alpha(theme.palette.error.main, 0.1);
                          icon = <PriorityHigh />;
                          break;
                        case 'Processing':
                          statusColor = theme.palette.warning.main;
                          statusBgColor = alpha(theme.palette.warning.main, 0.1);
                          icon = <AccessTime />;
                          break;
                        case 'Submitted':
                          statusColor = theme.palette.info.main;
                          statusBgColor = alpha(theme.palette.info.main, 0.1);
                          icon = <BugReport />;
                          break;
                        case 'Resolved':
                          statusColor = theme.palette.success.main;
                          statusBgColor = alpha(theme.palette.success.main, 0.1);
                          icon = <CheckCircleOutline />;
                          break;
                        default:
                          statusColor = theme.palette.grey[500];
                          statusBgColor = alpha(theme.palette.grey[500], 0.1);
                          icon = <BugReport />;
                      }
                      
                      return (
                        <React.Fragment key={ticket._id}>
                          <ListItem
                            sx={{ 
                              px: 2, 
                              py: 1.5, 
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                              },
                              cursor: 'pointer'
                            }}
                            component={RouterLink}
                            to={`/${encodeURIComponent(currentProject || '')}/tickets/${ticket._id}`}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: statusBgColor,
                                  color: statusColor
                                }}
                              >
                                {icon}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight="medium">
                                  {ticket.title || 'Unnamed Ticket'}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '90%' }}>
                                    {ticket.description || 'No description'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    <AccessTime fontSize="inherit" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                                    {ticket.updatedAt ? `Updated ${dayjs(ticket.updatedAt).fromNow()}` : 'Date unknown'}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Chip
                              label={ticket.status.replace(/([A-Z])/g, ' $1').trim()}
                              size="small"
                              sx={{
                                bgcolor: statusBgColor,
                                color: statusColor,
                                fontWeight: 'medium'
                              }}
                            />
                          </ListItem>
                          {index < Math.min(ticketAssigned.length, 4) - 1 && <Divider sx={{ my: 1 }} />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'text.secondary',
                    bgcolor: alpha(theme.palette.error.main, 0.03),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(theme.palette.error.main, 0.2)}`,
                  }}>
                    <BugReport sx={{ fontSize: 40, color: alpha(theme.palette.error.main, 0.3), mb: 1 }} />
                    <Typography>No tickets assigned yet</Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2 }}
                      component={RouterLink}
                      to={`/${encodeURIComponent(currentProject || '')}/tickets`}
                    >
                      View Tickets Page
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Recent Tasks */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardHeader 
                title={
                  <Typography variant="h6" fontWeight="bold">
                    Recent Tasks
                  </Typography>
                } 
                action={
                  <Button 
                    component={RouterLink}
                    to={`/${encodeURIComponent(currentProject || '')}/tasks`}
                    endIcon={<ArrowForward />}
                    size="small"
                  >
                    View All
                  </Button>
                }
              />
              <CardContent>
                {taskAssigned.length > 0 ? (
                  <List disablePadding>
                    {taskAssigned.slice(0, 4).map((task, index) => {
                      
                      return (
                        <React.Fragment key={task._id}>
                          <ListItem
                            sx={{ 
                              px: 2, 
                              py: 1.5, 
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                              },
                              cursor: 'pointer'
                            }}
                            component={RouterLink}
                            to={`/${encodeURIComponent(currentProject || '')}/tasks/${task._id}`}
                          >
                            <ListItemAvatar>
                              <Avatar>
                                <Assignment />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight="medium">
                                  {task.name || 'Unnamed Task'}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '90%' }}>
                                    {task.description || 'No description'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    <AccessTime fontSize="inherit" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                                    {task.dueDate ? `Updated ${dayjs(task.dueDate).fromNow()}` : 'Date unknown'}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Chip
                              label={task.status === "completed" ? "Completed" : "Active"}
                              size="small"
                              sx={{
                                bgcolor: task.status === "completed" 
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : alpha(theme.palette.primary.main, 0.1),
                                color: task.status === "completed" 
                                  ? theme.palette.success.main
                                  : theme.palette.primary.main,
                                fontWeight: 'medium'
                              }}
                            />
                          </ListItem>
                          {index < Math.min(taskAssigned.length, 4) - 1 && <Divider sx={{ my: 1 }} />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'text.secondary',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}>
                    <Assignment sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
                    <Typography>No tasks assigned yet</Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2 }}
                      component={RouterLink}
                      to={`/${encodeURIComponent(currentProject || '')}/tasks`}
                    >
                      View Tasks Page
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
