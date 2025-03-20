import { Vulnerability } from "~/interfaces/Entity";
import { User } from "../user";

export interface Ticket {
  _id: string;
  status: "open" | "closed";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee: User;
  assigner: User;
  targetedVulnerability: Vulnerability[];
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
