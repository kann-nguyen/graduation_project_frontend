import { Box, Container, Toolbar } from "@mui/material";
import { useParams } from "react-router-dom";
import ExtendedTicketTable from "~/components/styled-components/TicketTable";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";

export default function Ticket() {
  const { currentProject } = useParams();
  const ticketQuery = useTicketsQuery(currentProject);
  const tickets = ticketQuery.data?.data ?? [];

  return (
    <Box flexGrow={1} sx={{ m: { xs: 2, sm: 4 }, overflow: "auto" }}>
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <ExtendedTicketTable tickets={tickets} />
      </Container>
    </Box>
  );
}
