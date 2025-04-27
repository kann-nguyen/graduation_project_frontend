import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import ExtendedTicketTable from "~/components/styled-components/TicketTable";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";

export default function Ticket() {
  const { currentProject } = useParams();
  const ticketQuery = useTicketsQuery(currentProject);
  const tickets = ticketQuery.data?.data ?? [];

  if (ticketQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Box>
    );
  }

  return (
    <Box 
      component="main" 
      sx={{
        width: '100%',
        flexGrow: 1,
        p: 0,
        m: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <ExtendedTicketTable tickets={tickets} />
    </Box>
  );
}
