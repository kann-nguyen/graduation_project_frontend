import {
  AccountCircle,
  CheckCircleOutline,
  RefreshOutlined,
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
import {
  useMarkTicketMutation,
  useTicketQuery,
} from "~/hooks/fetching/ticket/query";
import { useGetResolutionQuery } from "~/hooks/fetching/vuln/query";
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
          {ticket.assigner.name}
        </Typography>
      </Box>
      <Divider variant="middle" />
      <Box>
        <Typography variant="h6">Assignee</Typography>
        <Box>
          <AccountCircle sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body1" display="inline">
            {ticket.assignee.name}
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
  const lastFive = history.slice(-5);
  return (
    <Timeline
      sx={{
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: 0.2,
        },
      }}
    >
      {lastFive.map((h, index) => (
        <TimelineItem>
          <TimelineOppositeContent color="textSecondary">
            {dayjs().to(dayjs(h.timestamp))}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            {index !== lastFive.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>{h.description}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
function MainContent({ ticket }: { ticket: Ticket }) {
  const cveIds = ticket.targetedVulnerability.map((v) => v.cveId);
  const resolutionQuery = useGetResolutionQuery(cveIds);
  const resolution = resolutionQuery.data?.data;
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
          <b>Description</b>
        </Typography>
        <Typography variant="body1">{ticket.description}</Typography>
      </Box>
      <Box>
        <Typography variant="h5">
          <b>Vulnerabilities</b>
        </Typography>
        {ticket.targetedVulnerability.map((v) => (
          <VulnDetailsCard
            vuln={v}
            resolution={resolution?.find((x) => x.cveId === v.cveId)}
          />
        ))}
      </Box>
    </Stack>
  );
}

export default function TicketDetail() {
  const { ticketId } = useParams();
  const ticketMutation = useMarkTicketMutation();
  function closeTicket() {
    if (ticketId) {
      ticketMutation.mutate({ id: ticketId, status: "closed" });
    }
  }
  function reopenTicket() {
    if (ticketId) {
      ticketMutation.mutate({ id: ticketId, status: "open" });
    }
  }
  if (!ticketId) return <></>;
  const ticketQuery = useTicketQuery(ticketId);
  const ticket = ticketQuery.data?.data;
  if (!ticket) return <></>;
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
            {ticket.status === "open" ? (
              <Button
                variant="contained"
                startIcon={<CheckCircleOutline />}
                onClick={closeTicket}
                color="success"
              >
                Close ticket
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<RefreshOutlined />}
                onClick={reopenTicket}
              >
                Reopen ticket
              </Button>
            )}
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
