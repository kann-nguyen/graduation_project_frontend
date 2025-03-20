export interface ActivityHistory {
  _id: string;
  id: string;
  action: "pr" | "commit";
  content: string;
  createdBy: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}
interface IndividualContribution {
  author: string;
  total: number;
}
export interface Commits {
  total: number;
  contribution: IndividualContribution[];
}
export interface PullRequests {
  total: number;
  contribution: IndividualContribution[];
}
