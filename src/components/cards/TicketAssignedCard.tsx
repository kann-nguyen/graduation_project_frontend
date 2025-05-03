import {
  BugReport,
  FilterList,
  Search,
  Clear,
  Sort,
  CalendarToday,
  NavigateNext,
  PriorityHigh,
  LowPriority,
  Tune,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  Stack,
  SxProps,
  Typography,
  alpha,
  Collapse,
  IconButton,
  Badge,
  Button,
  Menu,
  MenuItem,
  Divider,
  Chip,
  InputBase,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Ticket } from "~/hooks/fetching/ticket";
import TicketStatusChip from "~/components/styled-components/TicketStatusChip";
import Empty from "/empty.png";
import dayjs from "dayjs";
import PriorityChip from "../styled-components/PriorityChip";

const numberOfTicketsPerPage = 5;

export default function TicketAssigned({
  tickets,
  sx,
}: {
  tickets: Ticket[];
  sx?: SxProps;
}) {
  const { currentProject } = useParams();
  const encodedUrl = encodeURIComponent(currentProject);
  const theme = useTheme();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState<null | HTMLElement>(null);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    // Apply search filter
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply status filter
    const matchesStatus = filterStatus === "all" ? true : ticket.status === filterStatus;
    
    // Apply priority filter
    const matchesPriority = filterPriority === "all" ? true : ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / numberOfTicketsPerPage));
  const displayedTickets = filteredTickets.slice(
    (currentPage - 1) * numberOfTicketsPerPage,
    currentPage * numberOfTicketsPerPage
  );
  
  // Calculate ticket statistics
  const notAcceptedTickets = tickets.filter(t => t.status === "Not accepted").length;
  const processingTickets = tickets.filter(t => t.status === "Processing").length;
  const submittedTickets = tickets.filter(t => t.status === "Submitted").length;
  const resolvedTickets = tickets.filter(t => t.status === "Resolved").length;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not accepted": return theme.palette.grey[500];
      case "Processing": return theme.palette.warning.main;
      case "Submitted": return theme.palette.primary.main;
      case "Resolved": return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };
  
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };
  
  const handlePriorityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPriorityAnchorEl(event.currentTarget);
  };
  
  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    setStatusAnchorEl(null);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  const handlePriorityChange = (priority: string) => {
    setFilterPriority(priority);
    setPriorityAnchorEl(null);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterPriority("all");
    setCurrentPage(1);
  };
  
  const hasActiveFilters = searchTerm !== "" || filterStatus !== "all" || filterPriority !== "all";

  return (
    <Card sx={{ ...sx, borderRadius: 2, overflow: "hidden" }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BugReport sx={{ color: theme.palette.error.main, mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Security Tickets
            </Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={1}>
            {tickets.length > 0 && (
              <Chip 
                label={`${resolvedTickets}/${tickets.length} resolved`} 
                color="error"
                size="small"
                variant="outlined"
              />
            )}
            <IconButton 
              onClick={() => setShowFilters(!showFilters)}
              color={hasActiveFilters ? "primary" : "default"}
            >
              <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
                <FilterList />
              </Badge>
            </IconButton>
          </Stack>
        }
        sx={{ 
          pb: 1,
          borderBottom: !showFilters ? `1px solid ${theme.palette.divider}` : 'none',
        }}
      />
      
      <Collapse in={showFilters}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={2}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: alpha(theme.palette.error.main, 0.04),
                borderRadius: 1,
                px: 2,
                py: 0.5,
              }}
            >
              <Search sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase 
                placeholder="Search tickets..." 
                fullWidth 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ fontSize: '0.9rem' }}
              />
              {searchTerm && (
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <Clear fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleStatusMenuOpen}
                  startIcon={<Sort />}
                  sx={{ minWidth: 130 }}
                >
                  {filterStatus === "all" 
                    ? "All Status" 
                    : filterStatus}
                </Button>
                
                <Menu
                  anchorEl={statusAnchorEl}
                  open={Boolean(statusAnchorEl)}
                  onClose={() => setStatusAnchorEl(null)}
                >
                  <MenuItem 
                    selected={filterStatus === "all"} 
                    onClick={() => handleStatusChange("all")}
                  >
                    All Status
                  </MenuItem>
                  <MenuItem 
                    selected={filterStatus === "Not accepted"} 
                    onClick={() => handleStatusChange("Not accepted")}
                  >
                    Not Accepted
                  </MenuItem>
                  <MenuItem 
                    selected={filterStatus === "Processing"} 
                    onClick={() => handleStatusChange("Processing")}
                  >
                    Processing
                  </MenuItem>
                  <MenuItem 
                    selected={filterStatus === "Submitted"} 
                    onClick={() => handleStatusChange("Submitted")}
                  >
                    Submitted
                  </MenuItem>
                  <MenuItem 
                    selected={filterStatus === "Resolved"} 
                    onClick={() => handleStatusChange("Resolved")}
                  >
                    Resolved
                  </MenuItem>
                </Menu>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePriorityMenuOpen}
                  startIcon={filterPriority === "high" ? <PriorityHigh /> : <LowPriority />}
                  sx={{ minWidth: 130 }}
                >
                  {filterPriority === "all" 
                    ? "All Priority" 
                    : filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}
                </Button>
                
                <Menu
                  anchorEl={priorityAnchorEl}
                  open={Boolean(priorityAnchorEl)}
                  onClose={() => setPriorityAnchorEl(null)}
                >
                  <MenuItem 
                    selected={filterPriority === "all"} 
                    onClick={() => handlePriorityChange("all")}
                  >
                    All Priority
                  </MenuItem>
                  <MenuItem 
                    selected={filterPriority === "high"} 
                    onClick={() => handlePriorityChange("high")}
                  >
                    High
                  </MenuItem>
                  <MenuItem 
                    selected={filterPriority === "medium"} 
                    onClick={() => handlePriorityChange("medium")}
                  >
                    Medium
                  </MenuItem>
                  <MenuItem 
                    selected={filterPriority === "low"} 
                    onClick={() => handlePriorityChange("low")}
                  >
                    Low
                  </MenuItem>
                </Menu>
              </Stack>
              
              {hasActiveFilters && (
                <Button 
                  variant="text" 
                  size="small" 
                  startIcon={<Clear />} 
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </Stack>
        </Box>
      </Collapse>
      
      {tickets.length > 0 && (
        <Box 
          sx={{ 
            display: 'flex', 
            px: 3, 
            py: 1, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <Box sx={{ display: 'flex' }}>
              <Tooltip title="Not accepted">
                <Chip 
                  label={notAcceptedTickets} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    color: theme.palette.grey[700],
                    fontWeight: 'bold',
                    mr: 1
                  }}
                />
              </Tooltip>
              <Tooltip title="Processing">
                <Chip 
                  label={processingTickets} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.dark,
                    fontWeight: 'bold',
                    mr: 1
                  }}
                />
              </Tooltip>
              <Tooltip title="Submitted">
                <Chip 
                  label={submittedTickets} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.dark,
                    fontWeight: 'bold',
                    mr: 1
                  }}
                />
              </Tooltip>
              <Tooltip title="Resolved">
                <Chip 
                  label={resolvedTickets} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.dark,
                    fontWeight: 'bold'
                  }}
                />
              </Tooltip>
            </Box>
            <Tooltip title="Open Tickets page">
              <Button 
                variant="text" 
                size="small" 
                endIcon={<NavigateNext />}
                component={RouterLink}
                to={`/${encodedUrl}/tickets`}
              >
                View All
              </Button>
            </Tooltip>
          </Box>
        </Box>
      )}
      
      <CardContent sx={{ height: (sx as any)?.height ? `calc(${(sx as any).height} - 140px)` : 360, p: 0 }}>
        {tickets.length === 0 ? (
          <Stack sx={{ alignItems: "center", justifyContent: "center", height: "100%", p: 3 }}>
            <img
              src={Empty}
              style={{
                width: 120,
                height: 120,
                opacity: 0.7,
              }}
              alt="No tickets"
            />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No assigned tickets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 1 }}>
              You don't have any security tickets assigned to you yet.
            </Typography>
          </Stack>
        ) : filteredTickets.length === 0 ? (
          <Stack sx={{ alignItems: "center", justifyContent: "center", height: "100%", p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No matching tickets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search or filters
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<Clear />} 
              onClick={clearFilters}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          </Stack>
        ) : (
          <List disablePadding>
            {displayedTickets.map((ticket, index) => (
              <Box key={ticket._id}>
                <ListItem
                  component={RouterLink}
                  to={`/${encodedUrl}/tickets/${ticket._id}`}
                  sx={{ 
                    px: 3, 
                    py: 1.5,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <BugReport sx={{ color: getStatusColor(ticket.status) }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{
                            fontWeight: "medium",
                            color: 'text.primary',
                          }}
                        >
                          {ticket.title}
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                          <PriorityChip priority={ticket.priority} />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ticket.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                          <TicketStatusChip status={ticket.status} />
                          
                          <Tooltip title="Created date">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarToday fontSize="small" sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {dayjs(ticket.createdAt).format("MMM D, YYYY")}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Stack>
                    }
                  />
                </ListItem>
                {index < displayedTickets.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
      
      {filteredTickets.length > 0 && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {displayedTickets.length} of {filteredTickets.length} tickets
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            size="small"
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}
    </Card>
  );
}
