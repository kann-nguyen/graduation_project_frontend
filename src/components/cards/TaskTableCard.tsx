import { CheckBox, CheckBoxOutlineBlank, Search } from "@mui/icons-material";
import {
  Box,
  Card,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  debounce,
} from "@mui/material";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { Task } from "~/hooks/fetching/task";
import { useUpdateTaskMutation } from "~/hooks/fetching/task/query";
import { useUserByAccountIdQuery } from "~/hooks/fetching/user/query";
import { useUserRole } from "~/hooks/general";
function TaskTable({ tasks }: { tasks: Task[] }) {
  const userRole = useUserRole();
  const userInfoQuery = useUserByAccountIdQuery();
  const userInfo = userInfoQuery.data?.data;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const updateTaskMutation = useUpdateTaskMutation();
  function markTask(id: string, status: "active" | "completed") {
    return () => {
      if (!userInfo) return;
      updateTaskMutation.mutate({
        id,
        data: {
          status,
        },
      });
    };
  }
  const onPageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const onRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const taskSlice = tasks.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  return (
    <Card>
      <Box sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskSlice.map((t) => (
              <TableRow key={t._id} hover>
                <TableCell>{t.name}</TableCell>
                <TableCell align="center">{t.status}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell>{dayjs(t.dueDate).format("DD/MM/YYYY")}</TableCell>
                <TableCell>
                  {userRole === "member" && (
                    <Tooltip
                      title={
                        t.status === "active" ? "Mark as completed" : "Undo"
                      }
                    >
                      <IconButton
                        edge="end"
                        onClick={markTask(
                          t._id,
                          t.status === "active" ? "completed" : "active"
                        )}
                      >
                        {t.status === "active" ? (
                          <CheckBoxOutlineBlank />
                        ) : (
                          <CheckBox />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
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
          count={tasks.length}
        />
      </Box>
    </Card>
  );
}

export default function ExtendedTaskTable({ tasks }: { tasks: Task[] }) {
  const [displayTasks, setDisplayTasks] = useState(tasks);
  useEffect(() => {
    setDisplayTasks(tasks);
  }, [tasks]);
  function handleFilterTask(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value === "all") {
      setDisplayTasks(tasks);
    } else {
      setDisplayTasks(tasks.filter((t) => t.status === value));
    }
  }
  const searchTask = debounce((event) => {
    const value = event.target.value;
    if (value === "") {
      setDisplayTasks(tasks);
    } else {
      setDisplayTasks(
        tasks.filter((t) => t.name.toLowerCase().includes(value))
      );
    }
  }, 500);
  return (
    <Stack spacing={3}>
      <Card sx={{ p: 2, display: "flex" }}>
        <OutlinedInput
          defaultValue=""
          fullWidth
          placeholder="Search task"
          startAdornment={
            <InputAdornment position="start">
              <Search color="action" fontSize="small" />
            </InputAdornment>
          }
          onChange={searchTask}
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
            onChange={handleFilterTask}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="active">Active</option>
          </TextField>
        </Stack>
      </Card>
      <Box width="100%">
        <TaskTable tasks={displayTasks} />
      </Box>
    </Stack>
  );
}
