export interface Task {
  _id: string;
  name: string;
  description: string;
  status: "active" | "completed";
  dueDate: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TaskCreate
  extends Omit<Task, "_id" | "createdBy" | "updatedBy" | "dueDate"> {
  dueDate: Date;
}
export interface TaskUpdate extends Partial<TaskCreate> {}
