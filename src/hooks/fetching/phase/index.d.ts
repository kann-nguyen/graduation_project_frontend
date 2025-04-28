import { Artifact } from "../artifact";
import { Scanner } from "../scanner";

export interface Phase {
  _id: string;
  name: string;
  tasks: Task[];
  artifacts: Artifact[];
  scanners?: Scanner[];
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
