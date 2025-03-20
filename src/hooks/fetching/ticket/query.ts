import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTicket, getTicket, getTickets, markTicket } from "./axios";
import { useSnackbar } from "notistack";
import { TicketCreate } from ".";
import { toast } from "~/utils/toast";

export function useTicketsQuery(projectName: string) {
  return useQuery(["tickets", projectName], () => getTickets(projectName));
}
export function useCreateTicketMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (ticket: TicketCreate) => createTicket(ticket),
    onSuccess: (response) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["tickets"]);
        queryClient.invalidateQueries(["changeHistory"]);
      });
    },
  });
}
export function useTicketQuery(id: string) {
  return useQuery(["ticket", id], () => getTicket(id));
}
export function useMarkTicketMutation() {
  interface MarkTicketParams {
    id: string;
    status: "open" | "closed";
  }
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: ({ id, status }: MarkTicketParams) => markTicket(id, status),
    onSuccess: (response, { id }) => {
      toast(response, enqueueSnackbar, () => {
        queryClient.invalidateQueries(["ticket", id]);
        queryClient.invalidateQueries(["changeHistory"]);
      });
    },
  });
}
