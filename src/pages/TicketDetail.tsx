import {
  AccountCircle,
  CheckCircleOutline,
  RefreshOutlined,
  AssignmentInd,
} from "@mui/icons-material";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  timelineItemClasses,
  timelineOppositeContentClasses,
} from "@mui/lab";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useParams } from "react-router-dom";
import VulnDetailsCard from "~/components/cards/VulnDetailsCard";
import PriorityChip from "~/components/styled-components/PriorityChip";
import TicketStatusChip from "~/components/styled-components/TicketStatusChip";
import { useChangeHistoryQuery } from "~/hooks/fetching/change-history/query";
import { Ticket } from "~/hooks/fetching/ticket";
import { useMarkTicketMutation, useTicketQuery } from "~/hooks/fetching/ticket/query";
import { updateTicketState } from "~/hooks/fetching/ticket/axios";
import { useMutation, useQueryClient } from '@tanstack/react-query';

dayjs.extend(relativeTime);
function Headline({ ticket }: { ticket: Ticket }) {
  const relativeTime = dayjs().to(dayjs(ticket.updatedAt));
  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 2 }}>
        {ticket.title}
      </Typography>
      <TicketStatusChip status={ticket.status} />
      <Typography variant="body2" display="inline" sx={{ ml: 1 }}>
        {`This ticket was ${ticket.status} at ${relativeTime}`}
      </Typography>
    </Box>
  );
}

function RightColumn({ ticket }: { ticket: Ticket }) {
  return (
    <Stack spacing={1}>
      <Box>
        <Typography variant="h6">Assigner</Typography>
        <AccountCircle sx={{ fontSize: 16, mr: 1 }} />
        <Typography variant="body1" display="inline">
          {ticket.assigner ? ticket.assigner.name : "Unassigned"}
        </Typography>
      </Box>
      <Divider variant="middle" />
      <Box>
        <Typography variant="h6">Assignee</Typography>
        <Box>
          <AccountCircle sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body1" display="inline">
            {ticket.assignee ? ticket.assignee.name : "Unassigned"}
          </Typography>
        </Box>
      </Box>
      <Divider variant="middle" />
      <Box>
        <Typography variant="h6">Priority</Typography>
        <Typography variant="body1">
          <PriorityChip priority={ticket.priority} />
        </Typography>
      </Box>
    </Stack>
  );
}
function History({ ticketId }: { ticketId: string }) {
  const query = useChangeHistoryQuery(ticketId);
  const history = query.data?.data ?? [];
  // Sort history by timestamp in descending order (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
      <Timeline
        sx={{
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.2,
          },
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {sortedHistory.map((h, index) => (
          <TimelineItem key={h._id}>
            <TimelineOppositeContent color="text.secondary">
              {dayjs().to(dayjs(h.timestamp))}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary" />
              {index !== sortedHistory.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography>{h.description}</Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(h.timestamp).format('MMMM D, YYYY [at] HH:mm')}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}
export default function TicketDetail() {
  const { ticketId } = useParams();
  const queryClient = useQueryClient();

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
    refetchInterval: 2000 // Refetch every 2 seconds
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

  if (!ticketId) return <></>;
  const ticket = ticketQuery.data?.data;
  if (!ticket) return <></>;

  const getActionButton = () => {
    switch (ticket.status) {
      case "Not accepted":
        return (
          <Button
            variant="contained"
            startIcon={<AssignmentInd />}
            onClick={handleStatusUpdate}
            color="primary"
          >
            Assign
          </Button>
        );
      case "Processing":
        return (
          <Button
            variant="contained"
            startIcon={<CheckCircleOutline />}
            onClick={handleStatusUpdate}
            color="success"
          >
            Submit
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Box flexGrow={1} height="100vh">
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Stack spacing={2} sx={{ m: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={4}
            alignItems="flex-end"
          >
            <Headline ticket={ticket} />
            {getActionButton()}
          </Stack>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <MainContent ticket={ticket} />
            </Grid>
            <Grid item xs={3}>
              <RightColumn ticket={ticket} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

function MainContent({ ticket }: { ticket: Ticket }) {
  const cveIds = [ticket.targetedThreat];

  
  interface Resolution {
    cveId: string;
    // Add other properties as needed
  }

  return (
    <Stack spacing={5}>
      <Box>
        <Typography variant="h5">
          <b>History</b>
        </Typography>
        <History ticketId={ticket._id} />
      </Box>
      <Box>
        <Typography variant="h5">
          <b>Details</b>
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary">Created</Typography>
            <Typography>{dayjs(ticket.createdAt).format('MMMM D, YYYY [at] HH:mm')}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary">Last Updated</Typography>
            <Typography>{dayjs(ticket.updatedAt).format('MMMM D, YYYY [at] HH:mm')}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary">Description</Typography>
            <Typography variant="body1">{ticket.description}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary">Project</Typography>
            <Typography>{ticket.projectName}</Typography>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Typography variant="h5">
          <b>Associated Threat</b>
        </Typography>
      </Box>
    </Stack>
  );
}
