import { Vulnerability } from "~/interfaces/Entity";
import { User } from "../user";

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "Not accepted" | "Processing" | "Submitted" | "Resolved";
  assignee: User | null; // Ensure this matches the backend
  assigner: User | null;
  artifactId: string; // Added if present in the backend
  targetedThreat: string; // Added if present in the backend
  projectName: string;
  createdAt: string;
  updatedAt: string;
}
export interface TicketCreate {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee: string;
  targetedVulnerability: Vulnerability[];
  projectName: string;
}
