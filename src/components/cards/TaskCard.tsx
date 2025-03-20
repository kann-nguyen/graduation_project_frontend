import { Add } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { User } from "~/hooks/fetching/user";
import AssignTaskDialog from "~/components/dialogs/AssignTaskDialog";

const rowsPerPage = 5;
export default function TaskCard({ member }: { member: User }) {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const handlePageChange = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };
  const list = member.taskAssigned.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );
  return (
    <Card>
      <CardHeader title="Tasks" />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((t, index) => (
              <TableRow key={index}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.status}</TableCell>
                <TableCell>{t.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={member.taskAssigned.length}
          onPageChange={handlePageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
        />
        <Divider />
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button
            color="inherit"
            endIcon={<Add />}
            size="small"
            variant="text"
            onClick={() => setOpen(true)}
          >
            Assign
          </Button>
        </CardActions>
      </CardContent>
      <AssignTaskDialog open={open} setOpen={setOpen} />
    </Card>
  );
}
