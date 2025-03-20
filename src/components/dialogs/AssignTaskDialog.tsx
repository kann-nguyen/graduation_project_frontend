import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useTasksQuery } from "~/hooks/fetching/task/query";
import { useAssignTaskMutation } from "~/hooks/fetching/user/query";
import { useGetMembersOfProjectQuery } from "~/hooks/fetching/project/query";
interface FormData {
  taskId: string;
  memberId: string;
}
export default function AssignTaskDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { control, handleSubmit } = useForm<FormData>();
  const { currentProject } = useParams();
  const availableTasksQuery = useTasksQuery(currentProject);
  const availableTasks = availableTasksQuery.data?.data;
  const membersQuery = useGetMembersOfProjectQuery(currentProject);
  const members = membersQuery.data?.data;
  const assignTaskMutation = useAssignTaskMutation();
  async function onSubmit(data: FormData) {
    const { taskId, memberId } = data;
    assignTaskMutation.mutate({
      memberId,
      taskId,
    });
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Assign task</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1">Task:</Typography>
              <Controller
                name="taskId"
                control={control}
                render={({ field }) => (
                  <Select {...field} sx={{ width: 450 }}>
                    {availableTasks?.map((task) => (
                      <MenuItem key={task._id} value={task._id}>
                        <ListItemText
                          primary={task.name}
                          secondary={
                            <>
                              <Typography variant="body2">
                                <b>Description: </b>
                                {task.description}
                              </Typography>
                              <Typography variant="body2">
                                <b>Due date: </b>
                                {dayjs(task.dueDate).format("DD/MM/YYYY")}
                              </Typography>
                            </>
                          }
                        />
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1">Member:</Typography>
              <Controller
                name="memberId"
                control={control}
                render={({ field }) => (
                  <Select {...field} sx={{ width: 450 }}>
                    {members?.map((member) => (
                      <MenuItem key={member._id} value={member._id}>
                        <ListItemText
                          primary={member.name}
                          secondary={member.account.username}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
