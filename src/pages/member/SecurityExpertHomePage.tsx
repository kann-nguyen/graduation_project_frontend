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
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Badge
} from "@mui/material";
import {
  Assignment,
  BugReport,
  Security,
  Dashboard,
  ArrowForward,
  Business,
  CalendarToday,
  AccessTime,
  Timeline,
  Warning,
  Error as ErrorIcon,
  ShieldOutlined,
  CheckCircleOutline,
  PriorityHigh
} from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useActivityHistoryQuery } from "~/hooks/fetching/history/query";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";
import { useThreatsQuery } from "~/hooks/fetching/threat/query";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";
import { Threat } from "~/hooks/fetching/threat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUserByAccountIdQuery } from '~/hooks/fetching/user/query';
import ProjectSelector from "~/components/layout-components/ProjectSelector";

// Extend dayjs with relative time
dayjs.extend(relativeTime);

export default function SecurityExpertHomePage() {
  const { currentProject } = useParams();
  const ticketsQuery = useTicketsQuery(currentProject || '');
  const threatsQuery = useThreatsQuery();
  const actHistQuery = useActivityHistoryQuery(currentProject || '');
  const actHist = actHistQuery.data?.data;
  const projectInfoQuery = useProjectInfoQuery(currentProject || '');
  const projectInfo = projectInfoQuery.data?.data;
  const theme = useTheme();
  const userQuery = useUserByAccountIdQuery();
  const user = userQuery.data?.data;

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

  const tickets = ticketsQuery.data?.data || [];
  const threats = threatsQuery.data?.data || [];

  // Calculate ticket statistics
  const notAcceptedTickets = tickets.filter(t => t.status === "Not accepted").length;
  const processingTickets = tickets.filter(t => t.status === "Processing").length;
  const submittedTickets = tickets.filter(t => t.status === "Submitted").length;
  const resolvedTickets = tickets.filter(t => t.status === "Resolved").length;
  const totalTickets = tickets.length;

  // Ticket resolution rate - only count closed tickets, not submitted ones
  const ticketResolutionRate = totalTickets > 0
    ? Math.round((resolvedTickets / totalTickets) * 100)
    : 0;

  // Calculate threat statistics by type
  const threatTypeCount = {
    'Spoofing': 0,
    'Tampering': 0,
    'Repudiation': 0,
    'Information Disclosure': 0,
    'Denial of Service': 0,
    'Elevation of Privilege': 0,
    'Unknown': 0
  };

  threats.forEach(threat => {
    if (threat.type && threat.type in threatTypeCount) {
      threatTypeCount[threat.type as keyof typeof threatTypeCount]++;
    } else {
      threatTypeCount['Unknown']++;
    }
  });

  // Calculate threat mitigation statistics
  const nonMitigatedThreats = threats.filter(t => t.status === "Non mitigated").length;
  const partiallyMitigatedThreats = threats.filter(t => t.status === "Partially mitigated").length;
  const fullyMitigatedThreats = threats.filter(t => t.status === "Fully mitigated").length;
  const totalThreats = threats.length;

  // Threat mitigation rate
  const threatMitigationRate = totalThreats > 0
    ? Math.round(((partiallyMitigatedThreats * 0.5 + fullyMitigatedThreats) / totalThreats) * 100)
    : 0;

  // Get threat type icon and color
  const getThreatTypeInfo = (type: string) => {
    switch (type) {
      case 'Spoofing':
        return { icon: '👤', color: theme.palette.error.main };
      case 'Tampering':
        return { icon: '🔧', color: theme.palette.warning.main };
      case 'Repudiation':
        return { icon: '❌', color: theme.palette.error.dark };
      case 'Information Disclosure':
        return { icon: '🔍', color: theme.palette.info.main };
      case 'Denial of Service':
        return { icon: '🛑', color: theme.palette.error.light };
      case 'Elevation of Privilege':
        return { icon: '⬆️', color: theme.palette.warning.dark };
      default:
        return { icon: '❓', color: theme.palette.grey[500] };
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
            <Security sx={{ fontSize: 180, position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)' }} />
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
                  flex: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                }}>
                  <Typography variant="body2" color="text.secondary">Total Threats</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.error.main, my: 0.5 }}>
                    {threats.length}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Mitigation Progress</Typography>
                      <Typography variant="caption" fontWeight="medium">{threatMitigationRate}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={threatMitigationRate}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.error.main
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{
                  p: 2,
                  borderRadius: 2,
                  flex: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                }}>
                  <Typography variant="body2" color="text.secondary">Open Tickets</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.warning.main, my: 0.5 }}>
                    {notAcceptedTickets + processingTickets + submittedTickets}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Resolution Progress</Typography>
                      <Typography variant="caption" fontWeight="medium">{ticketResolutionRate}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={ticketResolutionRate}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.warning.main
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Ticket Statistics - Full Width */}
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
            Security Ticket Statistics
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
                <Typography variant="body2" color="text.secondary" noWrap>Closed</Typography>
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
        </Paper>

        {/* Threat Type Statistics */}
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
            Threat Type Distribution
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {Object.entries(threatTypeCount).map(([type, count]) => {
              if (count === 0 && type === 'Unknown') return null;
              const typeInfo = getThreatTypeInfo(type);

              return (
                <Grid item xs={6} sm={4} md={2} key={type}>
                  <Paper elevation={0} sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(typeInfo.color, 0.05),
                    border: `1px solid ${alpha(typeInfo.color, 0.1)}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: alpha(typeInfo.color, 0.1), color: typeInfo.color, width: 24, height: 24, fontSize: '0.9rem', mr: 1 }}>
                        {typeInfo.icon}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                        {type}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: typeInfo.color }}>
                      {count}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* Dashboard Content */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Recent Threats */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight="bold">
                    Recent Threats
                  </Typography>
                }
                action={
                  <Button
                    component={RouterLink}
                    to={`/${encodeURIComponent(currentProject || '')}/threats`}
                    endIcon={<ArrowForward />}
                    size="small"
                  >
                    View All
                  </Button>
                }
              />
              <CardContent>
                {threats.length > 0 ? (
                  <List disablePadding>
                    {threats.slice(0, 4).map((threat, index) => {
                      const typeInfo = getThreatTypeInfo(threat.type);

                      return (
                        <React.Fragment key={threat._id}>
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
                            to={`/${encodeURIComponent(currentProject || '')}/threats/${threat._id}`}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: alpha(typeInfo.color, 0.1),
                                  color: typeInfo.color
                                }}
                              >
                                {typeInfo.icon}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight="medium">
                                  {threat.name || 'Unnamed Threat'}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '90%' }}>
                                    {threat.description || 'No description'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Type: {threat.type}
                                  </Typography>
                                </Box>
                              }
                            />

                          </ListItem>
                          {index < Math.min(threats.length, 4) - 1 && <Divider sx={{ my: 1 }} />}
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
                    <ShieldOutlined sx={{ fontSize: 40, color: alpha(theme.palette.error.main, 0.3), mb: 1 }} />
                    <Typography>No threats found</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                      component={RouterLink}
                      to={`/${encodeURIComponent(currentProject || '')}/threats`}
                    >
                      View Threats Page
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
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
                {tickets.length > 0 ? (
                  <List disablePadding>
                    {tickets.slice(0, 4).map((ticket, index) => {
                      // Map ticket status to colors
                      let statusColor;
                      let statusBgColor;
                      let icon;

                      switch (ticket.status) {
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
                          icon = <ShieldOutlined />;
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
                              label={ticket.status}
                              size="small"
                              sx={{
                                bgcolor: statusBgColor,
                                color: statusColor,
                                fontWeight: 'medium'
                              }}
                            />
                          </ListItem>
                          {index < Math.min(tickets.length, 4) - 1 && <Divider sx={{ my: 1 }} />}
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
        </Grid>
      </Container>
    </Box>
  );
}