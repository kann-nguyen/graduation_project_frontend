import React, { useState } from 'react';
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
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  LinearProgress,
  Link as MuiLink
} from "@mui/material";
import { 
  AssignmentOutlined,
  BugReportOutlined,
  Business,
  CalendarToday,
  Code,
  Group,
  LinkOutlined,
  SecurityOutlined,
  InsertChartOutlined,
  DashboardOutlined,
  CheckCircleOutline,
  SchemaOutlined,
  Timeline
} from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useUserByAccountIdQuery } from "~/hooks/fetching/user/query";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";
import { useGetMembersOfProjectQuery } from "~/hooks/fetching/project/query";
import { Task } from "~/hooks/fetching/task";
import { Project } from "~/hooks/fetching/project";
import { Phase } from "~/hooks/fetching/phase";
import AvatarImage from "/avatar.webp";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs
dayjs.extend(relativeTime);

export default function ProjectPage() {
  const { currentProject } = useParams();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Fetch data
  const userQuery = useUserByAccountIdQuery();
  const user = userQuery.data?.data;
  const projectInfoQuery = useProjectInfoQuery(currentProject);
  const projectInfo = projectInfoQuery.data?.data;
  const membersQuery = useGetMembersOfProjectQuery(currentProject);
  const members = membersQuery.data?.data || [];
  
  // Loading state
  if (!projectInfo || !user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Typography>Loading project information...</Typography>
      </Box>
    );
  }
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Get tasks and tickets assigned to the current user
  const { taskAssigned, ticketAssigned } = user;
  const activeTasks = taskAssigned.filter(task => task.status === "active").length;
  const completedTasks = taskAssigned.filter(task => task.status === "completed").length;
  const totalTickets = ticketAssigned.length;
  const resolvedTickets = ticketAssigned.filter(ticket => ticket.status === "Resolved").length;
  
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
        {/* Project Header */}
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
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="flex-start">
              <Grid item xs={12} md={7}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {projectInfo.name}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3,
                    flexWrap: 'wrap'
                  }}>
                    {projectInfo.url && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ color: alpha(theme.palette.primary.main, 0.7), mr: 1, fontSize: '1.2rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          Repository: <MuiLink 
                            href={projectInfo.url} 
                            target="_blank" 
                            underline="hover"
                            sx={{ color: theme.palette.primary.main }}
                          >
                            {projectInfo.url.split('/').pop() || 'Link'}
                          </MuiLink>
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ color: alpha(theme.palette.primary.main, 0.7), mr: 1, fontSize: '1.2rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        Created: {projectInfo.createdAt ? dayjs(projectInfo.createdAt).format('MMM DD, YYYY') : 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Project Tabs */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 2, 
            mb: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': {
                py: 2
              }
            }}
          >
            <Tab 
              icon={<DashboardOutlined />} 
              label="Overview" 
              iconPosition="start"
              sx={{ fontWeight: 'medium' }}
            />
            <Tab 
              icon={<InsertChartOutlined />} 
              label="Phases" 
              iconPosition="start"
              sx={{ fontWeight: 'medium' }}
            />
            <Tab 
              icon={<Group />} 
              label="Team" 
              iconPosition="start"
              sx={{ fontWeight: 'medium' }}
            />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {/* Overview Tab */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ 
                    height: '100%', 
                    boxShadow: 'none', 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: 2 
                  }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" fontWeight="bold">
                          Project Structure
                        </Typography>
                      } 
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Grid container spacing={3} direction="column">
                    {/* My Tasks Summary */}
                    <Grid item>
                      <Card sx={{ 
                        boxShadow: 'none', 
                        border: `1px solid ${theme.palette.divider}`, 
                        borderRadius: 2 
                      }}>
                        <CardHeader 
                          title={
                            <Typography variant="h6" fontWeight="bold">
                              My Tasks
                            </Typography>
                          } 
                          action={
                            <Button 
                              component={RouterLink}
                              to={`/${encodeURIComponent(currentProject || '')}/tasks`}
                              size="small"
                            >
                              View All
                            </Button>
                          }
                        />
                        <CardContent>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 1.5 
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  mr: 1.5,
                                  width: 40,
                                  height: 40
                                }}
                              >
                                <AssignmentOutlined />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Active Tasks
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {activeTasks}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.main,
                                  mr: 1.5,
                                  width: 40,
                                  height: 40
                                }}
                              >
                                <CheckCircleOutline />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Completed
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {completedTasks}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <LinearProgress 
                            variant="determinate" 
                            value={taskAssigned.length > 0 ? (completedTasks / taskAssigned.length) * 100 : 0} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* My Tickets Summary */}
                    <Grid item>
                      <Card sx={{ 
                        boxShadow: 'none', 
                        border: `1px solid ${theme.palette.divider}`, 
                        borderRadius: 2 
                      }}>
                        <CardHeader 
                          title={
                            <Typography variant="h6" fontWeight="bold">
                              My Tickets
                            </Typography>
                          } 
                          action={
                            <Button 
                              component={RouterLink}
                              to={`/${encodeURIComponent(currentProject || '')}/tickets`}
                              size="small"
                            >
                              View All
                            </Button>
                          }
                        />
                        <CardContent>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 1.5 
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  color: theme.palette.error.main,
                                  mr: 1.5,
                                  width: 40,
                                  height: 40
                                }}
                              >
                                <BugReportOutlined />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Total Tickets
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {totalTickets}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.main,
                                  mr: 1.5,
                                  width: 40,
                                  height: 40
                                }}
                              >
                                <SecurityOutlined />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Resolved
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {resolvedTickets}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <LinearProgress 
                            variant="determinate" 
                            value={ticketAssigned.length > 0 ? (resolvedTickets / ticketAssigned.length) * 100 : 0} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.success.main,
                              }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
            
            {/* Team Tab */}
            {tabValue === 2 && (
              <Box>
                {members.length > 0 ? (
                  <Grid container spacing={3}>
                    {members.map((member) => (
                      <Grid item xs={12} sm={6} md={4} key={member._id}>
                        <Card sx={{ 
                          boxShadow: 'none', 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: 2 
                        }}>
                          <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                            <Avatar
                              src={AvatarImage}
                              sx={{
                                width: 80,
                                height: 80,
                                mb: 2,
                                mx: 'auto'
                              }}
                            />
                            <Typography variant="h6" fontWeight="medium" gutterBottom>
                              {member.name}
                            </Typography>
                            <Chip
                              label={member.account?.role?.replace('_', ' ')}
                              size="small"
                              color={
                                member.account?.role === 'project_manager' ? 'primary' :
                                member.account?.role === 'security_expert' ? 'error' : 'default'
                              }
                              sx={{ 
                                textTransform: 'capitalize',
                                mb: 2
                              }}
                            />
                          </CardContent>
                          <Box sx={{ p: 2, pt: 0, textAlign: 'center' }}>
                            <Button
                              variant="outlined"
                              component={RouterLink}
                              to={`/${encodeURIComponent(currentProject || '')}/members/${member._id}`}
                              size="small"
                            >
                              View Profile
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ 
                    py: 5, 
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}>
                    <Group sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      No Team Members Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This project doesn't have any team members assigned yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}