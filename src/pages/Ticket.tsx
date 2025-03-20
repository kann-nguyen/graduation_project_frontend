import { Box, Container, Toolbar } from "@mui/material";
import ExtendedTicketTable from "~/components/styled-components/TicketTable";

export default function Ticket() {
  return (
    <Box
      flexGrow={1}
      sx={{
        m: {
          xs: 2,
          sm: 4,
        },
        overflow: "auto",
      }}
    >
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <ExtendedTicketTable />
      </Container>
    </Box>
  );
}
