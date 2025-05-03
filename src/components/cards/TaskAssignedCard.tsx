import { CheckCircleOutline, MoreVert, AccessTime, Assignment, PriorityHigh } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, MouseEvent } from "react";
import { Task } from "~/hooks/fetching/task";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateTaskMutation } from "~/hooks/fetching/task/query";

dayjs.extend(relativeTime);

export default function TaskAssigned({ tasks, sx }: { tasks: Task[], sx?: SxProps }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentProject } = useParams();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const updateTaskMutation = useUpdateTaskMutation();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleMenuOpen = (event: MouseEvent<HTMLElement>, taskId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTaskId(null);
  };
  
  const handleToggleStatus = () => {
    if (!selectedTaskId) return;
    
    const task = tasks.find(t => t._id === selectedTaskId);
    if (!task) return;
    
    const newStatus = task.status === 'active' ? 'completed' : 'active';
    
    updateTaskMutation.mutate({
      id: selectedTaskId,
      data: {
        status: newStatus
      }
    });
    
    handleMenuClose();
  };
  
  const isPastDue = (dueDate: string) => {
    return dayjs(dueDate).isBefore(dayjs()) && dayjs(dueDate).isValid();
  };
  
  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'completed') return theme.palette.success.main;
    if (isPastDue(dueDate)) return theme.palette.error.main;
    return theme.palette.primary.main;
  };

  // Empty state
  if (tasks.length === 0) {
    return (
      <Card sx={{ ...sx, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <Assignment sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks assigned
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any tasks assigned to you yet
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={sx}>
      <CardContent sx={{ p: 0 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Task Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Due Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task) => (
                  <TableRow 
                    key={task._id} 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.04) 
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Assignment sx={{ 
                          color: getStatusColor(task.status, task.dueDate),
                          mr: 1,
                          opacity: task.status === 'completed' ? 0.7 : 1
                        }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            color: task.status === 'completed' ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {task.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          opacity: task.status === 'completed' ? 0.7 : 1
                        }}
                      >
                        {task.description || "No description provided"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={task.status === 'active' ? 'Active' : 'Completed'}
                        size="small"
                        sx={{ 
                          bgcolor: task.status === 'completed' 
                            ? alpha(theme.palette.success.main, 0.1) 
                            : alpha(theme.palette.primary.main, 0.1),
                          color: task.status === 'completed' 
                            ? theme.palette.success.main 
                            : theme.palette.primary.main,
                          fontWeight: 'medium',
                          px: 1
                        }}
                        icon={task.status === 'completed' ? <CheckCircleOutline fontSize="small" /> : undefined}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AccessTime fontSize="small" sx={{ 
                          mr: 0.5, 
                          color: isPastDue(task.dueDate) && task.status !== 'completed' 
                            ? theme.palette.error.main 
                            : 'text.secondary',
                          fontSize: '1rem'
                        }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isPastDue(task.dueDate) && task.status !== 'completed' 
                              ? theme.palette.error.main 
                              : 'text.secondary'
                          }}
                        >
                          {dayjs(task.dueDate).format('MMM DD, YYYY')}
                          {isPastDue(task.dueDate) && task.status !== 'completed' && (
                            <Typography component="span" variant="caption" sx={{ ml: 0.5, color: theme.palette.error.main }}>
                              (Overdue)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, task._id)}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleToggleStatus}>
            {tasks.find(t => t._id === selectedTaskId)?.status === 'active' 
              ? 'Mark as completed' 
              : 'Mark as active'}
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}
