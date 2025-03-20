import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Ticket } from "~/hooks/fetching/ticket";
import Empty from "/empty.png";
const numberOfTaskPerPage = 5;
export default function TicketAssigned({
  tickets,
  sx,
}: {
  tickets: Ticket[];
  sx?: SxProps;
}) {
  const { currentProject } = useParams();
  const encodedUrl = encodeURIComponent(currentProject);
  const [currentPage, setCurrentPage] = useState(0);
  function handlePageChange(event: React.ChangeEvent<unknown>, value: number) {
    setCurrentPage(value - 1);
  }
  const currentPageList = tickets.slice(
    currentPage,
    currentPage + numberOfTaskPerPage
  );
  return (
    <Card sx={sx}>
      <CardHeader title="Ticket Assigned" />
      <CardContent sx={{ height: 400 }}>
        {tickets.length === 0 ? (
          <Stack sx={{ alignItems: "center" }}>
            <img
              src={Empty}
              style={{
                width: 150,
                height: 150,
              }}
            />
            <Typography variant="h6" color="textSecondary">
              There's nothing here...
            </Typography>
          </Stack>
        ) : (
          <Stack sx={{ height: "100%" }}>
            <List sx={{ flexGrow: 1 }}>
              {currentPageList.map((ticket) => (
                <ListItem key={ticket._id}>
                  <ListItemIcon>
                    {ticket.priority === "low"
                      ? "🟢"
                      : ticket.priority === "medium"
                      ? "🟠"
                      : "🔴"}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Link
                        component={RouterLink}
                        to={`/${encodedUrl}/tickets/${ticket._id}`}
                      >
                        {ticket.title}
                      </Link>
                    }
                    secondary={ticket.description}
                  />
                </ListItem>
              ))}
            </List>
            <Pagination
              sx={{ display: "flex", justifyContent: "center" }}
              count={Math.ceil(tickets.length / numberOfTaskPerPage)}
              onChange={handlePageChange}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
