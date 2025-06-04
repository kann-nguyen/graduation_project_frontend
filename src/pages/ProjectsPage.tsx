import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Toolbar,
  Paper,
  Typography,
  useTheme,
  alpha,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Button,
  Tooltip,
  Skeleton
} from "@mui/material";
import {
  Search,
  FilterList,
  Dashboard,
  CalendarToday,
  Update,
  BugReport,
  FactCheck,
  ArrowForward,
  AssignmentOutlined,
  Code as CodeIcon
} from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useProjectInQuery } from "~/hooks/fetching/user/query";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";
import { useAllProjectStats } from "~/hooks/fetching/project/statistics";
import { useThreatsQuery } from "~/hooks/fetching/threat/query";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs
dayjs.extend(relativeTime);

export default function ProjectsPage() {
  const { currentProject } = useParams();
  const projectInQuery = useProjectInQuery();
  const projects = projectInQuery.data?.data || [];
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
    // Get project names for stats
  const projectNames = projects.map(project => project.name);
  
  // Get project task and artifact counts
  const { taskCounts, artifactCounts, isLoading: isLoadingStats } = useAllProjectStats(projectNames);
    // Track ticket counts
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  
  // Use the existing axios and query hooks for fetching tickets
  useEffect(() => {
    const fetchTicketCounts = async () => {
      if (!projects.length) {
        setIsLoadingTickets(false);
        return;
      }
      
      setIsLoadingTickets(true);
      const counts: Record<string, number> = {};
      
      // Use Promise.all for parallel processing
      try {
        const promises = projects.map(async (project) => {
          try {
            // Use the same API the ticket query hook uses
            const response = await import("~/hooks/fetching/ticket/axios")
              .then(module => module.getTickets(project.name));
            
            counts[project.name] = response.data?.length || 0;
          } catch (error) {
            console.error(`Error fetching tickets for ${project.name}:`, error);
            counts[project.name] = 0;
          }
        });
        
        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching ticket counts:", error);
      } finally {
        setTicketCounts(counts);
        setIsLoadingTickets(false);
      }
    };
    
    fetchTicketCounts();
  }, [projects]);
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
    // Determine loading and error states
  const isLoading = projectInQuery.isLoading || isLoadingStats || isLoadingTickets;
  const isError = projectInQuery.isError;
  
  // Handle error state
  if (isError && !isLoading) {
    return (
      <Box sx={{
        flexGrow: 1,
        minHeight: "100vh",
        width: "100%",
        overflow: "auto",
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.04),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Toolbar />
        <Container sx={{ py: 3 }} maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              border: `1px solid ${theme.palette.error.light}`,
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Error Loading Projects
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              There was an error loading your projects. Please try again later or contact support.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

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
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
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
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage all your projects in one place
            </Typography>
              {/* Search and filter */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 2,
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <TextField
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  flexGrow: 1, 
                  maxWidth: { xs: '100%', sm: '50%' }
                }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh">
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      // Refresh all data
                      projectInQuery.refetch();
                    }}
                    disabled={isLoading}
                  >
                    <Update fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Filter">
                  <IconButton size="small">
                    <FilterList fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Paper>
          {/* Projects Grid */}
        <Grid container spacing={3}>
          {isLoading ? (
            // Show loading skeletons
            Array.from(new Array(3)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ 
                  boxShadow: 'none', 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={30} width="60%" sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={20} width="80%" sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={40} width="40%" sx={{ ml: 'auto' }} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <Card sx={{ 
                  boxShadow: 'none', 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Project header with status */}
                    <Box sx={{ 
                      p: 2, 
                      pb: 1.5, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {project.description || 'No description'}
                        </Typography>
                      </Box>
                      <Chip 
                        label={project.status} 
                        size="small"
                        color={project.status === 'active' ? 'success' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    
                    <Divider />
                    
                    {/* Project stats */}
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        {/* Created date */}
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarToday sx={{ mr: 1, fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Created</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {dayjs(project.createdAt).format('MMM D, YYYY')}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Updated date */}
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Update sx={{ mr: 1, fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Updated</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {dayjs(project.updatedAt).format('MMM D, YYYY')}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>                          {/* Number of tasks - Using real data */}
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AssignmentOutlined sx={{ mr: 1, fontSize: '0.9rem', color: theme.palette.warning.main }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Tasks</Typography>
                              {isLoading ? (
                                <Skeleton width={30} height={24} />
                              ) : (
                                <Typography variant="body2" fontWeight="medium">
                                  {taskCounts[project.name] || 0}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Number of tickets - Using real data */}
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FactCheck sx={{ mr: 1, fontSize: '0.9rem', color: theme.palette.info.main }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Tickets</Typography>
                              {isLoading ? (
                                <Skeleton width={30} height={24} />
                              ) : (
                                <Typography variant="body2" fontWeight="medium">
                                  {ticketCounts[project.name] || 0}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Action buttons */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          variant="contained" 
                          endIcon={<ArrowForward />} 
                          component={RouterLink}
                          to={`/${encodeURIComponent(project.name)}/`}
                          size="small"
                          sx={{ 
                            fontWeight: 'medium', 
                            borderRadius: 1.5,
                            boxShadow: 1
                          }}
                        >
                          View Project
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ 
                py: 6, 
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
              }}>
                <Dashboard sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No projects found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {searchQuery ? 'No projects match your search criteria.' : 'You are not a member of any projects yet.'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
