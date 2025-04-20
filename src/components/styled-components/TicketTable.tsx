import { Add, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  InputAdornment,
  Link,
  OutlinedInput,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import AddTicketDialog from "~/components/dialogs/AddTicketDialog";
import PriorityChip from "~/components/styled-components/PriorityChip";
import TicketStatusChip from "~/components/styled-components/TicketStatusChip";
import { Ticket } from "~/hooks/fetching/ticket";
import { updateTicketState } from "~/hooks/fetching/ticket/axios";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";
import { usePermissionHook } from "~/hooks/general";
import { useMutation } from "@tanstack/react-query";
interface TabProps {
  tickets: Ticket[];
}
function renderDate(date: string) {
  return dayjs(date).format("DD/MM/YYYY");
}

function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const ticketSlice = tickets.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const permission = usePermissionHook();
  const mutation = useMutation(updateTicketState, {
    onSuccess: () => {
      // Optionally refetch tickets or show a success message
      console.log("Ticket status updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update ticket status:", error);
    },
  });

  const handleStatusClick = (ticket: Ticket) => {
    if (ticket.status === "Not accepted" && permission.includes("manager")) {
      mutation.mutate({ id: ticket._id, status: "Processing" });
    } else if (ticket.status === "Processing" && ticket.assignee?._id === "currentUserId") {
      mutation.mutate({ id: ticket._id, status: "Submitted" });
    }
  };

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell align="center">Priority</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell>Assigner</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ticketSlice.map((ticket) => (
            <TableRow key={ticket._id}>
              <TableCell>{ticket.title}</TableCell>
              <TableCell align="center">
                <PriorityChip priority={ticket.priority} />
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleStatusClick(ticket)}
                style={{ cursor: "pointer", color: "blue" }}
              >
                <TicketStatusChip status={ticket.status} />
              </TableCell>
              <TableCell>{ticket.assignee?.name || "Unassigned"}</TableCell>
              <TableCell>{ticket.assigner?.name || "Unknown"}</TableCell>
              <TableCell>{dayjs(ticket.createdAt).format("DD/MM/YYYY")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={tickets.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Card>
  );
}

export default function ExtendedTicketTable() {
  const { currentProject } = useParams();
  const ticketQuery = useTicketsQuery(currentProject);
  const tickets = ticketQuery.data?.data ?? [];
  const [displayTickets, setDisplayTickets] = useState(tickets);

  useEffect(() => {
    setDisplayTickets(tickets);
  }, [tickets]);

  function handleFilterTicket(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value === "all") {
      setDisplayTickets(tickets);
    } else {
      setDisplayTickets(tickets.filter((t) => t.status === value));
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" spacing={4}>
        <Typography variant="h4">Tickets</Typography>
        <TextField
          label="Filter by Status"
          select
          SelectProps={{ native: true }}
          onChange={handleFilterTicket}
          sx={{ minWidth: 200 }}
        >
          <option value="all">All</option>
          <option value="Not accepted">Not Accepted</option>
          <option value="Processing">Processing</option>
          <option value="Submitted">Submitted</option>
          <option value="Resolved">Resolved</option>
        </TextField>
      </Stack>
      <TicketTable tickets={displayTickets} />
    </Stack>
  );
}
