// Project: Ticket Management System
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
  Collapse,
  alpha,
  Skeleton,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { FilterList, Search, Clear, Add, NavigateBefore, NavigateNext, FirstPage, LastPage } from "@mui/icons-material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import AddTicketDialog from "~/components/dialogs/AddTicketDialog";
import PriorityChip from "~/components/styled-components/PriorityChip";
import TicketStatusChip from "~/components/styled-components/TicketStatusChip";
import { Ticket } from "~/hooks/fetching/ticket";
import { updateTicketState } from "~/hooks/fetching/ticket/axios";
import { useUserRole, usePermissionHook } from "~/hooks/general";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

interface TabProps {
  tickets: Ticket[];
  isLoading?: boolean;
}

function TicketTable({ tickets, isLoading }: { tickets: Ticket[]; isLoading?: boolean }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { currentProject } = useParams();
  const userRole = useUserRole();
  const queryClient = useQueryClient();
  const encodedUrl = encodeURIComponent(currentProject);
  const { enqueueSnackbar } = useSnackbar();
  const permission = usePermissionHook();
  
  const mutation = useMutation({
    mutationFn: updateTicketState,
    onSuccess: async (response, variables) => {
      // Invalidate specific ticket
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      // Invalidate change history
      queryClient.invalidateQueries({ queryKey: ['changeHistory'] });
      // Force refetch tickets
      await queryClient.invalidateQueries({ 
        queryKey: ['tickets'],
        refetchType: 'all'
      });
      enqueueSnackbar('Ticket status updated successfully', { variant: 'success' });
    },
    onError: (error) => {
      console.error("❌ Failed to update ticket status:", error);
      enqueueSnackbar('Failed to update ticket status', { variant: 'error' });
    },
  });

  const handleStatusClick = async (ticket: Ticket) => {
    if (!permission.includes("ticket:update")) {
      enqueueSnackbar('You do not have permission to update tickets', { variant: 'warning' });
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

  const ticketSlice = tickets.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <Card sx={{ width: '100%', overflowX: 'hidden' }}> {/* Ensure the table fits the screen width */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Ticket List
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
          disabled={isLoading}
        >
          Add Ticket
        </Button>
      </Box>
      <Table sx={{ tableLayout: 'fixed', width: '100%' }}> {/* Use fixed table layout */}
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>Priority</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>Assignee</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>Assigner</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from(new Array(rowsPerPage)).map((_, index) => (
              <TableRow key={index}>
                {Array.from(new Array(5)).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton animation="wave" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : ticketSlice.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No tickets found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            ticketSlice.map((ticket) => (
              <TableRow 
                key={ticket._id}
                sx={{
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    cursor: 'pointer'
                  },
                  transition: 'background-color 0.2s ease'
                }}
                onClick={() => window.location.href = `/${encodedUrl}/tickets/${ticket._id}`}
              >
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={`/${encodedUrl}/tickets/${ticket._id}`}
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ticket.title}
                  </Link>
                </TableCell>
                <TableCell align="center">
                  <PriorityChip priority={ticket.priority} />
                </TableCell>
                <TableCell align="center">{ticket.assignee?.name || "Unassigned"}</TableCell>
                <TableCell align="center">{ticket.assigner?.name || "Unknown"}</TableCell>
                <TableCell
                  align="center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusClick(ticket);
                  }}
                  sx={{ 
                    cursor: permission.includes("ticket:update") ? "pointer" : "not-allowed",
                    '&:hover': permission.includes("ticket:update") ? {
                      '& > *': {
                        transform: 'scale(1.05)',
                      }
                    } : {},
                  }}
                >
                  <Box sx={{ transition: 'transform 0.2s ease' }}>
                    <TicketStatusChip status={ticket.status} />
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" mr={2}>
            Rows per page:
          </Typography>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 80 }}>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value as string, 10));
                setPage(0);
              }}
              sx={{ 
                height: '32px',
                '& .MuiSelect-select': { py: 0.5 } 
              }}
            >
              {[5, 10, 25, 50].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" mr={2}>
            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, tickets.length)} of {tickets.length}
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Tooltip title="First page">
              <span>
                <IconButton 
                  size="small"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  sx={{ color: 'primary.main' }}
                >
                  <FirstPage fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Previous page">
              <span>
                <IconButton
                  size="small"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  sx={{ color: 'primary.main' }}
                >
                  <NavigateBefore fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Next page">
              <span>
                <IconButton
                  size="small"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(tickets.length / rowsPerPage) - 1}
                  sx={{ color: 'primary.main' }}
                >
                  <NavigateNext fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Last page">
              <span>
                <IconButton
                  size="small"
                  onClick={() => setPage(Math.max(0, Math.ceil(tickets.length / rowsPerPage) - 1))}
                  disabled={page >= Math.ceil(tickets.length / rowsPerPage) - 1}
                  sx={{ color: 'primary.main' }}
                >
                  <LastPage fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <AddTicketDialog open={openAddDialog} setOpen={setOpenAddDialog} />
    </Card>
  );
}

export default function ExtendedTicketTable({ tickets, isLoading }: TabProps) {
  const [displayTickets, setDisplayTickets] = useState(tickets);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    assignee: "all",
    assigner: "all"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const userRole = useUserRole();

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
    <Box sx={{ 
      width: '100%',
      height: '100%',
      padding: '0',
      margin: '0',
    }}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Tickets</Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <OutlinedInput
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search tickets by title or description..."
              startAdornment={
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              }
              sx={{ 
                maxWidth: '600px',
                borderRadius: 1,
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: (theme) => alpha(theme.palette.divider, 0.8),
                }
              }}
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {hasActiveFilters && (
                <Button 
                  variant="outlined" 
                  onClick={resetFilters} 
                  startIcon={<Clear />}
                >
                  Clear
                </Button>
              )}
              <Button
                variant={showFilters ? "contained" : "outlined"}
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterList />}
              >
                {showFilters ? "Hide Filters" : "Filters"}
              </Button>
            </Box>
          </Box>

          <Collapse in={showFilters}>
            <Box
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
                gap: 2,
                mb: 3,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                border: '1px solid',
                borderColor: 'divider',
                p: 2,
              }}
            >
              <TextField
                label="Status"
                select
                SelectProps={{ native: true }}
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ bgcolor: 'background.paper' }}
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
                variant="outlined"
                size="small"
                fullWidth
                sx={{ bgcolor: 'background.paper' }}
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
                variant="outlined"
                size="small"
                fullWidth
                sx={{ bgcolor: 'background.paper' }}
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
                variant="outlined"
                size="small"
                fullWidth
                sx={{ bgcolor: 'background.paper' }}
              >
                <option value="all">All Assigners</option>
                {uniqueAssigners.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </TextField>
            </Box>
          </Collapse>
        </Box>

        <TicketTable tickets={displayTickets} isLoading={isLoading} />
      </Box>
    </Box>
  );
}
