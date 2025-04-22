// Project: Ticket Management System
import {
  Box,
  Button,
  Card,
  CircularProgress,
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
  Collapse,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import { FilterList, Search, Clear, Add, InfoOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import AddTicketDialog from "~/components/dialogs/AddTicketDialog";
import PriorityChip from "~/components/styled-components/PriorityChip";
import TicketStatusChip from "~/components/styled-components/TicketStatusChip";
import { Ticket } from "~/hooks/fetching/ticket";
import { updateTicketState } from "~/hooks/fetching/ticket/axios";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";
import { useAccountContext, usePermissionHook } from "~/hooks/general";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TabProps {
  tickets: Ticket[];
}
function renderDate(date: string) {
  return dayjs(date).format("DD/MM/YYYY");
}

function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { currentProject } = useParams();

  const ticketSlice = tickets.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const permission = usePermissionHook();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: updateTicketState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error) => {
      console.error("❌ Failed to update ticket status:", error);
    },
  });

  const handleStatusClick = async (ticket: Ticket) => {
    if (!permission.includes("ticket:update")) {
      return;
    }
    
    let newStatus;
    switch(ticket.status) {
      case "Not accepted":
        newStatus = "Processing";
        break;
      case "Processing": 
        newStatus = "Submitted";
        break;
    }

    if (newStatus) {
      try {
        await mutation.mutateAsync({ id: ticket._id, status: newStatus });
      } catch (error) {
        console.error('Failed to update ticket:', error);
      }
    }
  };

  return (
    <Card>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Ticket
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell align="center">Priority</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell>Assigner</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell align="center">Actions</TableCell>
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
                style={{ 
                  cursor: permission.includes("ticket:update") ? "pointer" : "not-allowed",
                }}
              >
                <TicketStatusChip status={ticket.status} />
              </TableCell>
              <TableCell>{ticket.assignee?.name || "Unassigned"}</TableCell>
              <TableCell>{ticket.assigner?.name || "Unknown"}</TableCell>
              <TableCell>{dayjs(ticket.createdAt).format("DD/MM/YYYY")}</TableCell>
              <TableCell align="center">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<InfoOutlined />}
                  component={RouterLink}
                  to={`/projects/${currentProject}/tickets/${ticket._id}`}
                >
                  Details
                </Button>
              </TableCell>
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
      <AddTicketDialog open={openAddDialog} setOpen={setOpenAddDialog} />
    </Card>
  );
}

export default function ExtendedTicketTable() {
  const { currentProject } = useParams();
  const ticketQuery = useTicketsQuery(currentProject);
  const tickets = ticketQuery.data?.data ?? [];
  const [displayTickets, setDisplayTickets] = useState(tickets);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    assignee: "all",
    assigner: "all"
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setDisplayTickets(tickets);
  }, [tickets]);

  const uniqueAssignees = Array.from(new Set(tickets.map(t => t.assignee?.name || "Unassigned")));
  const uniqueAssigners = Array.from(new Set(tickets.map(t => t.assigner?.name || "Unknown")));

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    applyFilters(newFilters, searchQuery);
  };

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
    applyFilters(filters, value);
  }, 300);

  const applyFilters = (currentFilters: typeof filters, search: string) => {
    let filteredTickets = [...tickets];

    // Apply search filter
    if (search) {
      filteredTickets = filteredTickets.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply other filters
    if (currentFilters.status !== "all") {
      filteredTickets = filteredTickets.filter(t => t.status === currentFilters.status);
    }
    if (currentFilters.priority !== "all") {
      filteredTickets = filteredTickets.filter(t => t.priority === currentFilters.priority);
    }
    if (currentFilters.assignee !== "all") {
      filteredTickets = filteredTickets.filter(t => 
        (t.assignee?.name || "Unassigned") === currentFilters.assignee
      );
    }
    if (currentFilters.assigner !== "all") {
      filteredTickets = filteredTickets.filter(t => 
        (t.assigner?.name || "Unknown") === currentFilters.assigner
      );
    }

    setDisplayTickets(filteredTickets);
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      assignee: "all",
      assigner: "all"
    });
    setSearchQuery("");
    setDisplayTickets(tickets);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "all") || searchQuery !== "";

  return (
    <Stack spacing={3}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Tickets</Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterList color={hasActiveFilters ? "primary" : "inherit"} />
                </IconButton>
              </Tooltip>
              {hasActiveFilters && (
                <Tooltip title="Clear all filters">
                  <IconButton onClick={resetFilters}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          <OutlinedInput
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tickets by title..."
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            fullWidth
          />

          <Collapse in={showFilters}>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Status"
                select
                SelectProps={{ native: true }}
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <option value="all">All Status</option>
                <option value="Not accepted">Not Accepted</option>
                <option value="Processing">Processing</option>
                <option value="Submitted">Submitted</option>
                <option value="Resolved">Resolved</option>
              </TextField>

              <TextField
                label="Priority"
                select
                SelectProps={{ native: true }}
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </TextField>

              <TextField
                label="Assignee"
                select
                SelectProps={{ native: true }}
                value={filters.assignee}
                onChange={(e) => handleFilterChange("assignee", e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <option value="all">All Assignees</option>
                {uniqueAssignees.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </TextField>

              <TextField
                label="Assigner"
                select
                SelectProps={{ native: true }}
                value={filters.assigner}
                onChange={(e) => handleFilterChange("assigner", e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <option value="all">All Assigners</option>
                {uniqueAssigners.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </TextField>
            </Stack>
          </Collapse>
        </Stack>
      </Paper>

      <TicketTable tickets={displayTickets} />
    </Stack>
  );
}
