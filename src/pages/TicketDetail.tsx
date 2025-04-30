import {
  AccountCircle,
  CheckCircleOutline,
  AssignmentInd,
  BugReport,
  ArrowBack,
  CalendarToday,
  Description,
  Business,
  Schedule,
  MoreVert,
  Flag,
  Person,
  Security,
  LowPriority,
  PriorityHigh,
  Edit,
} from "@mui/icons-material";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses,
} from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useTheme,
  Tooltip,
  Avatar,
  LinearProgress,
  alpha,
  CircularProgress,
  breadcrumbsClasses,
  Breadcrumbs,
  Link,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useParams, useNavigate } from "react-router-dom";
import PriorityChip from "~/components/styled-components/PriorityChip";
import TicketStatusChip from "~/components/styled-components/TicketStatusChip";
import { useChangeHistoryQuery } from "~/hooks/fetching/change-history/query";
import { Ticket } from "~/hooks/fetching/ticket";
import { useTicketQuery } from "~/hooks/fetching/ticket/query";
import { updateTicketState } from "~/hooks/fetching/ticket/axios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Threat } from "~/hooks/fetching/threat";
import { useThreatQuery } from "~/hooks/fetching/threat/query";
import { typeOptions } from "~/utils/threat-display";
import { useState, useEffect } from "react";
import EditTicketDialog from "~/components/dialogs/EditTicketDialog";
import { getThreat } from "~/hooks/fetching/threat/axios";

dayjs.extend(relativeTime);

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high': return <PriorityHigh color="error" />;
    case 'medium': return <PriorityHigh color="warning" />;
    case 'low': return <LowPriority color="info" />;
    default: return <Flag />;
  }
};

function PageHeader({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { currentProject } = useParams();
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(`/${encodeURIComponent(currentProject || '')}/tickets`)}
          sx={{ mr: 2 }}
          variant="text"
          color="inherit"
        >
          Back to tickets
        </Button>
      
        
        <Box sx={{ flexGrow: 1 }} />
        
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setMenuAnchor(null);
          }}>
            Copy ticket link
          </MenuItem>
          <MenuItem onClick={() => {
            window.print();
            setMenuAnchor(null);
          }}>
            Print ticket details
          </MenuItem>
        </Menu>
      </Box>
      
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {ticket.title}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TicketStatusChip status={ticket.status} />
        <Chip 
          icon={getPriorityIcon(ticket.priority)} 
          label={`${ticket.priority.charAt(0).toUpperCase()}${ticket.priority.slice(1)} Priority`} 
          color={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'info'}
          variant="outlined"
        />
        <Tooltip title={dayjs(ticket.createdAt).format('MMMM D, YYYY [at] HH:mm')}>
          <Chip 
            icon={<CalendarToday fontSize="small" />} 
            label={`Created ${dayjs(ticket.createdAt).fromNow()}`} 
            variant="outlined"
            color="default"
          />
        </Tooltip>
        <Tooltip title={ticket.projectName}>
          <Chip 
            icon={<Business fontSize="small" />} 
            label={ticket.projectName} 
            variant="outlined"
            color="secondary"
          />
        </Tooltip>
      </Box>
    </Box>
  );
}

function TicketProgressCard({ ticket }: { ticket: Ticket }) {
  let progress = 0;
  
  switch (ticket.status) {
    case "Not accepted":
      progress = 0;
      break;
    case "Processing":
      progress = 50;
      break;
    case "Submitted":
      progress = 75;
      break;
    case "Resolved":
      progress = 100;
      break;
    default:
      progress = 0;
  }

  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        background: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Ticket Progress
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 5,
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: ticket.status === 'Resolved' 
                  ? theme.palette.success.main 
                  : theme.palette.primary.main,
              }
            }}
          />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Tooltip title="Not accepted">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                bgcolor: ticket.status === 'Not accepted' ? theme.palette.primary.main : 
                  progress > 0 ? theme.palette.success.main : theme.palette.grey[300]
              }} 
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>Start</Typography>
          </Box>
        </Tooltip>
        
        <Tooltip title="Processing">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                bgcolor: ticket.status === 'Processing' ? theme.palette.primary.main :
                  progress >= 50 ? theme.palette.success.main : theme.palette.grey[300]
              }} 
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>Processing</Typography>
          </Box>
        </Tooltip>
        
        <Tooltip title="Submitted">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                bgcolor: ticket.status === 'Submitted' ? theme.palette.primary.main :
                  progress >= 75 ? theme.palette.success.main : theme.palette.grey[300] 
              }} 
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>Submitted</Typography>
          </Box>
        </Tooltip>
        
        <Tooltip title="Resolved">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                bgcolor: ticket.status === 'Resolved' ? theme.palette.success.main : theme.palette.grey[300] 
              }} 
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>Resolved</Typography>
          </Box>
        </Tooltip>
      </Box>
    </Paper>
  );
}

function TicketInfoCard({ ticket }: { ticket: Ticket }) {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Ticket Details
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Description sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {ticket.description}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ color: 'text.secondary', mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {dayjs(ticket.updatedAt).format('MMMM D, YYYY [at] HH:mm')}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ color: 'text.secondary', mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Created On
              </Typography>
              <Typography variant="body1">
                {dayjs(ticket.createdAt).format('MMMM D, YYYY [at] HH:mm')}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

function AssignmentCard({ ticket }: { ticket: Ticket }) {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Assignment
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: ticket.assignee ? theme.palette.primary.main : theme.palette.grey[300],
              mr: 2 
            }}
          >
            {ticket.assignee ? 
              ticket.assignee.name.charAt(0).toUpperCase() : 
              <Person />
            }
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">Assignee</Typography>
            <Typography variant="body1" fontWeight="medium">
              {ticket.assignee ? ticket.assignee.name : "Unassigned"}
            </Typography>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: ticket.assigner ? theme.palette.secondary.main : theme.palette.grey[300],
              mr: 2 
            }}
          >
            {ticket.assigner ? 
              ticket.assigner.name.charAt(0).toUpperCase() : 
              <Person />
            }
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">Assigner</Typography>
            <Typography variant="body1" fontWeight="medium">
              {ticket.assigner ? ticket.assigner.name : "Unassigned"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function History({ ticketId }: { ticketId: string }) {
  const query = useChangeHistoryQuery(ticketId);
  const history = query.data?.data ?? [];
  const theme = useTheme();
  
  // Sort history by timestamp in descending order (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (query.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (sortedHistory.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No history records found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 2, mt: 1 }}>
      <Timeline
        sx={{
          p: 0,
          m: 0,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {sortedHistory.map((h, index) => (
          <TimelineItem key={h._id}>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  bgcolor: index === 0 ? theme.palette.primary.main : theme.palette.grey[400],
                  boxShadow: 'none',
                  margin: 0,
                }}
              />
              {index !== sortedHistory.length - 1 && (
                <TimelineConnector sx={{ bgcolor: theme.palette.divider }} />
              )}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="subtitle2">{h.description}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(h.timestamp).format('MMMM D, YYYY [at] HH:mm')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({dayjs(h.timestamp).fromNow()})
                </Typography>
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}

function ThreatDetailsCard({ threatId }: { threatId: string }) {
  const { currentProject } = useParams();
  const encodedUrl = encodeURIComponent(currentProject);
  const [threat, setThreat] = useState<Threat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchThreat = async () => {
      try {
        setIsLoading(true);
        const response = await getThreat(threatId);
        setThreat(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch threat"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreat();
  }, [threatId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography color="error">
          Error loading threat information: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!threat) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography color="error">
          Threat information not available
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Threat ID: {threatId}
        </Typography>
      </Box>
    );
  }

  const threatTypeInfo = typeOptions.find(opt => opt.name === threat.type);

  return (
    <Card 
      elevation={0} 
      sx={{ 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'visible'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.default, 0.6),
        }}
      >
        <BugReport sx={{ color: theme.palette.primary.main, mr: 1.5 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {threat.name || 'Unnamed Threat'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              STRIDE Type:
            </Typography>
            <Tooltip title={threatTypeInfo?.description || ""}>
              <Chip
                label={threat.type || 'Unknown'}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Description
        </Typography>
        <Typography variant="body2">
          {threat.description || 'No description available'}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            size="small"
            component={Link}
            href={`/${encodedUrl}/threats/${threat._id}`}
            sx={{ textDecoration: 'none' }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function TicketDetail() {
  const { ticketId } = useParams();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const ticketMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await updateTicketState({id, status});
      return response;
    },
    onSuccess: async () => {
      if (ticketId) {
        // Invalidate specific ticket
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
        // Invalidate change history
        queryClient.invalidateQueries({ queryKey: ['changeHistory'] });
        // Force refetch tickets for both member and manager views
        await queryClient.invalidateQueries({ 
          queryKey: ['tickets'],
          refetchType: 'all'
        });
      }
    },
    onError: (error) => {
      console.error("❌ Failed to update ticket status:", error);
    },
  });

  // Increase refetch interval to make updates more responsive
  const ticketQuery = useTicketQuery(ticketId || '', {
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  const handleStatusUpdate = async () => {
    if (!ticketId) return;

    let newStatus;
    switch(ticket?.status) {
      case "Not accepted":
        newStatus = "Processing";
        break;
      case "Processing": 
        newStatus = "Submitted";
        break;
      default:
        return;
    }

    if (newStatus) {
      try {
        await ticketMutation.mutateAsync({ id: ticketId, status: newStatus });
      } catch (error) {
        console.error('Failed to update ticket:', error);
      }
    }
  };

  if (ticketQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticketId || !ticketQuery.data?.data) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <Typography variant="h5" color="error">Ticket not found</Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tickets')}
        >
          Back to tickets
        </Button>
      </Box>
    );
  }

  const ticket = ticketQuery.data.data;

  const getActionButton = () => {
    if (ticketMutation.isLoading) {
      return (
        <Button
          variant="contained"
          disabled
          startIcon={<CircularProgress size={20} color="inherit" />}
        >
          Processing...
        </Button>
      );
    }
    
    switch (ticket.status) {
      case "Not accepted":
        return (
          <Button
            variant="contained"
            startIcon={<AssignmentInd />}
            onClick={handleStatusUpdate}
            color="primary"
            size="large"
          >
            Assign & Start Processing
          </Button>
        );
      case "Processing":
        return (
          <Button
            variant="contained"
            startIcon={<CheckCircleOutline />}
            onClick={handleStatusUpdate}
            color="success"
            size="large"
          >
            Submit for Review
          </Button>
        );
      default:
        return null;
    }
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
        <PageHeader ticket={ticket} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <TicketProgressCard ticket={ticket} />
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Targeted Security Threat
                </Typography>
                
                {ticket.targetedThreat ? (
                  <ThreatDetailsCard threatId={typeof ticket.targetedThreat === 'string' ? ticket.targetedThreat : (ticket.targetedThreat as { _id: string })._id} />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      No associated threat found for this ticket
                    </Typography>
                  </Box>
                )}
              </Paper>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Ticket History
                  </Typography>
                </Box>
                
                <History ticketId={ticket._id} />
              </Paper>
            </Stack>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Ticket Details
                  </Typography>
                  <Button
                    startIcon={<Edit />}
                    variant="outlined"
                    size="small"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Edit
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Description sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {ticket.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ color: 'text.secondary', mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1">
                          {dayjs(ticket.updatedAt).format('MMMM D, YYYY [at] HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ color: 'text.secondary', mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Created On
                        </Typography>
                        <Typography variant="body1">
                          {dayjs(ticket.createdAt).format('MMMM D, YYYY [at] HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <AssignmentCard ticket={ticket} />
              
              {getActionButton() && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {ticket.status === "Not accepted" 
                      ? "Ready to work on this ticket? Assign it to yourself and start processing."
                      : ticket.status === "Processing"
                      ? "Have you completed the required action on this ticket? Submit it for review."
                      : ""}
                  </Typography>
                  {getActionButton()}
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
      
      {/* Edit Ticket Dialog */}
      <EditTicketDialog 
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        ticket={ticket}
      />
    </Box>
  );
}
