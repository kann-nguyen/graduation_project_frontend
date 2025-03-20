import { Artifact } from "../artifact";

export interface Phase {
  _id: string;
  name: string;
  tasks: Task[];
  artifacts: Artifact[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface PhaseTemplate {
  _id: string;
  name: string;
  description: string;
  phases: {
    name: string;
    description: string;
    order: number;
  }[];
  isPrivate: boolean;
  createdBy: string;
}
export interface PhaseTemplateCreate
  extends Omit<PhaseTemplate, "_id" | "createdBy"> {}
export interface PhaseTemplateUpdate
  extends Omit<PhaseTemplate, "_id" | "createdBy" | "isPrivate"> {}
