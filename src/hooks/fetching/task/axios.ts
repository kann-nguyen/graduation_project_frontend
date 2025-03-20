import api from "~/api";
import { PromiseServer } from "~/hooks/fetching/response-type";
import { TaskCreate, Task, TaskUpdate } from ".";
export async function getAllTasks(projectName: string): PromiseServer<Task[]> {
  const response = await api.get(`/task`, {
    params: {
      projectName,
    },
  });
  return response.data;
}
export async function getAvailableTasks(
  projectName: string
): PromiseServer<Task[]> {
  const response = await api.get(`/task`, {
    params: {
      projectName,
      filter: "unassigned",
    },
  });
  return response.data;
}
export async function deleteTask(taskId: string): PromiseServer<null> {
  const response = await api.delete(`/task/${taskId}`);
  return response.data;
}
export async function createTask(
  task: TaskCreate,
  projectName: string
): PromiseServer<null> {
  const response = await api.post(`/task`, {
    data: {
      ...task,
      projectName,
    },
  });
  return response.data;
}
export async function updateTask(
  task: TaskUpdate,
  taskId: string
): PromiseServer<null> {
  const response = await api.patch(`/task/${taskId}`, { data: task });
  return response.data;
}
export async function getTask(taskId: string): PromiseServer<Task> {
  const response = await api.get(`/task/${taskId}`);
  return response.data;
}
