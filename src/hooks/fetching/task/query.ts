import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getAvailableTasks,
  getTask,
  updateTask,
} from "./axios";
import { TaskCreate, TaskUpdate } from ".";
import { useSnackbar } from "notistack";
import { toast } from "~/utils/toast";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["tasks"]);
      });
    },
  });
}
export function useCreateTaskMutation() {
  interface CreateTaskParams {
    data: TaskCreate;
    projectName: string;
  }
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ data, projectName }: CreateTaskParams) =>
      createTask(data, projectName),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["tasks"]);
      });
    },
  });
}
export function useUpdateTaskMutation() {
  interface UpdateTaskParams {
    data: TaskUpdate;
    id: string;
  }
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ data, id }: UpdateTaskParams) => updateTask(data, id),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["tasks"]);
        // Member page
        queryClient.invalidateQueries(["userInfo"]);
      });
    },
  });
}
export function useTaskQuery(id: string) {
  return useQuery(["tasks", id], () => getTask(id));
}
export function useTasksQuery(projectName: string) {
  return useQuery(["tasks", projectName], () => getAllTasks(projectName));
}
export function useAvailableTasksQuery(projectName: string) {
  return useQuery(["tasks", projectName], () => getAvailableTasks(projectName));
}
