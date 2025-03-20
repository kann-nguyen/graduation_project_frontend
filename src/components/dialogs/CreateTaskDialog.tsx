import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useCreateTaskMutation } from "~/hooks/fetching/task/query";
import { TaskCreate } from "~/hooks/fetching/task";

interface FormData extends Omit<TaskCreate, "dueDate"> {
  dueDate: Dayjs;
}

interface CreateTaskDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export default function CreateTaskDialog({
  open,
  setOpen,
}: CreateTaskDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  useEffect(() => {
    reset();
  }, [open]);
  const { currentProject } = useParams();
  const createTaskMutation = useCreateTaskMutation();
  async function onSubmit(data: FormData) {
    const dueDateNativeObject = dayjs(data.dueDate).toDate();
    createTaskMutation.mutate({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        dueDate: dueDateNativeObject,
      },
      projectName: currentProject as string,
    });
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create a new task</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Name"
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Description"
              {...register("description", {
                required: "Please give a short description",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <TextField
              label="Status"
              {...register("status")}
              disabled
              defaultValue="active"
            />
            <Controller
              name="dueDate"
              control={control}
              defaultValue={dayjs()}
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
          <Button type="submit">Create</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
