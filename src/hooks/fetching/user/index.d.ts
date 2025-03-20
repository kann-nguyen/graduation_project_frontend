import { Account } from "../account";
import { ActivityHistory } from "../history";
import { Project } from "../project";
import { Task } from "../task";
import { Ticket } from "../ticket";

export interface User {
  _id: string;
  name: string;
  taskAssigned: Task[];
  ticketAssigned: Ticket[];
  activityHistory: ActivityHistory[];
  account: Account;
  projectIn: Project[];
}
