import {
  Assignment,
  CheckBox,
  CheckBoxOutlineBlank,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  Stack,
  SxProps,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Task } from "~/hooks/fetching/task";
import { useUpdateTaskMutation } from "~/hooks/fetching/task/query";
import { useUserByAccountIdQuery } from "~/hooks/fetching/user/query";
import Empty from "/empty.png";
const numberOfTaskPerPage = 5;
export default function TaskAssigned({
  tasks,
  sx,
}: {
  tasks: Task[];
  sx?: SxProps;
}) {
  const userInfoQuery = useUserByAccountIdQuery();
  const userInfo = userInfoQuery.data?.data;
  const [currentPage, setCurrentPage] = useState(0);
  const updateTaskMutation = useUpdateTaskMutation();
  function handlePageChange(event: React.ChangeEvent<unknown>, value: number) {
    setCurrentPage(value - 1);
  }
  const currentPageList = tasks.slice(
    currentPage,
    currentPage + numberOfTaskPerPage
  );
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
  return (
    <Card sx={sx}>
      <CardHeader title="Task Assigned" />
      <CardContent sx={{ height: 400 }}>
        {tasks.length === 0 ? (
          <Stack sx={{ alignItems: "center" }}>
            <img
              src={Empty}
              style={{
                width: 150,
                height: 150,
              }}
            />
            <Typography variant="h6" color="textSecondary">
              There's nothing here...
            </Typography>
          </Stack>
        ) : (
          <Stack sx={{ height: "100%" }}>
            <List sx={{ flexGrow: 1 }}>
              {currentPageList.map((task) => (
                <ListItem
                  key={task._id}
                  secondaryAction={
                    <Tooltip
                      title={
                        task.status === "active" ? "Mark as completed" : "Undo"
                      }
                    >
                      <IconButton
                        edge="end"
                        onClick={markTask(
                          task._id,
                          task.status === "active" ? "completed" : "active"
                        )}
                      >
                        {task.status === "active" ? (
                          <CheckBoxOutlineBlank />
                        ) : (
                          <CheckBox />
                        )}
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.name}
                    secondary={task.description}
                    sx={{
                      textDecoration:
                        task.status === "completed" ? "line-through" : "none",
                    }}
                  />
                </ListItem>
              ))}
            </List>
            <Pagination
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
              count={Math.ceil(tasks.length / numberOfTaskPerPage)}
              onChange={handlePageChange}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
