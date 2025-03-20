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
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";
import { usePermissionHook } from "~/hooks/general";
interface TabProps {
  tickets: Ticket[];
}
function renderDate(date: string) {
  return dayjs(date).format("DD/MM/YYYY");
}
function TicketTable({ tickets }: TabProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const onPageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const onRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const ticketSlice = tickets.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );
  return (
    <Card sx={{ minHeight: 500 }}>
      <Box sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="center">Priority</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Assigned to</TableCell>
              <TableCell>Created at</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ticketSlice.map((ticket) => (
              <TableRow key={ticket._id} hover>
                <TableCell>
                  <Link
                    underline="none"
                    component={RouterLink}
                    to={`${ticket._id}`}
                  >
                    {ticket.title}
                  </Link>
                </TableCell>
                <TableCell align="center">
                  <PriorityChip priority={ticket.priority} />
                </TableCell>
                <TableCell align="center">
                  <TicketStatusChip status={ticket.status} />
                </TableCell>
                <TableCell>{ticket.assignee.name}</TableCell>
                <TableCell>{renderDate(ticket.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          count={tickets.length}
        />
      </Box>
    </Card>
  );
}

export default function ExtendedTicketTable() {
  const permission = usePermissionHook();
  const createTicketPermission = permission.includes("ticket:create");
  const [open, setOpen] = useState(false);
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
  const searchTicket = debounce((event) => {
    const value = event.target.value;
    if (value === "") {
      setDisplayTickets(tickets);
    } else {
      setDisplayTickets(
        tickets.filter((t) => t.title.toLowerCase().includes(value))
      );
    }
  }, 500);
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" spacing={4}>
        <Typography variant="h4">Tickets</Typography>
        <div>
          <Button
            startIcon={<Add fontSize="small" />}
            variant="contained"
            disabled={!createTicketPermission}
            onClick={() => setOpen(true)}
          >
            Add ticket
          </Button>
        </div>
      </Stack>
      <Card sx={{ p: 2, display: "flex" }}>
        <OutlinedInput
          defaultValue=""
          fullWidth
          placeholder="Search ticket"
          startAdornment={
            <InputAdornment position="start">
              <Search color="action" fontSize="small" />
            </InputAdornment>
          }
          onChange={searchTicket}
          sx={{ maxWidth: 500 }}
        />
        <Stack
          direction="row"
          spacing={1}
          width="100%"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Typography variant="h6">Filter:</Typography>
          <TextField
            label="Status"
            select
            SelectProps={{ native: true }}
            sx={{ minWidth: 200 }}
            onChange={handleFilterTicket}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </TextField>
        </Stack>
      </Card>
      <Box width="100%">
        <TicketTable tickets={displayTickets} />
      </Box>
      <AddTicketDialog open={open} setOpen={setOpen} />
    </Stack>
  );
}
