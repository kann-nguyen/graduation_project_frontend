import { Phase } from "../phase";

export interface Project {
  _id: string;
  name: string;
  url: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  phaseList: Phase[];
}
