import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  useTaskQuery,
  useUpdateTaskMutation,
} from "~/hooks/fetching/task/query";
import { TaskCreate } from "~/hooks/fetching/task";

interface FormData extends Omit<TaskCreate, "dueDate"> {
  dueDate: Dayjs;
}

interface UpdateTaskDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string | undefined;
}
export default function EditTaskDialog({
  open,
  setOpen,
  id,
}: UpdateTaskDialogProps) {
  if (!id) return <></>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormData>();
  useEffect(() => {
    reset();
  }, [id]);
  const getTaskInfoQuery = useTaskQuery(id);
  const updateTaskMutation = useUpdateTaskMutation();
  const task = getTaskInfoQuery.data?.data;
  if (!task) return <></>;
  async function onSubmit(data: FormData) {
    if (!id) return;
    const sendData = {
      ...data,
      dueDate: dayjs(data.dueDate).toDate(),
    };
    updateTaskMutation.mutate({ data: sendData, id });
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Update task</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Name"
              {...register("name", { required: "Name is required" })}
              defaultValue={task.name}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              defaultValue={task.description}
              label="Description"
              {...register("description", {
                required: "Please give a short description",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Status" defaultValue={task.status}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              )}
            />
            <Controller
              name="dueDate"
              control={control}
              defaultValue={dayjs(task.dueDate)}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  disablePast
                  label="Due date"
                  format="DD-MM-YYYY"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit">Update</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
