import { Phase } from "../phase";

export interface Project {
  _id: string;
  name: string;
  url: string;
  status: "active" | "inactive";
  description?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  phaseList: Phase[];
}
