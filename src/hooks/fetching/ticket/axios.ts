import api from "~/api";
import { PromiseServer } from "~/hooks/fetching/response-type";
import { Ticket, TicketCreate } from ".";

export async function getTickets(projectName: string): PromiseServer<Ticket[]> {
  const response = await api.get("/ticket", {
    params: {
      projectName,
    },
  });
  return response.data;
}
export async function createTicket(ticket: TicketCreate): PromiseServer<null> {
  const response = await api.post("/ticket", {
    data: ticket,
  });
  return response.data;
}
export async function getTicket(id: string): PromiseServer<Ticket> {
  const response = await api.get(`/ticket/${id}`);
  return response.data;
}
export async function markTicket(
  id: string,
  status: "open" | "closed"
): PromiseServer<null> {
  const response = await api.patch(`/ticket/${id}`, {
    data: {
      status,
    },
  });
  return response.data;
}
