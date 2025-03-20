import { Commit } from "@mui/icons-material";
import {
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { PullRequest } from "~/icons/Icons";
import { User } from "~/hooks/fetching/user";
const rowsPerPage = 5;
import dayjs from "dayjs";
export default function ActivityHistoryCard({
  member,
  sx,
}: {
  member: User;
  sx?: SxProps;
}) {
  const [page, setPage] = useState(0);
  const handlePageChange = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };
  const list = member.activityHistory.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );
  return (
    <Card sx={sx}>
      <CardHeader title="Activity history" />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Activity</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((a, index) => (
              <TableRow key={index}>
                <TableCell align="center">
                  {a.action === "pr" ? <PullRequest /> : <Commit />}
                </TableCell>
                <TableCell>{a.content}</TableCell>
                <TableCell>
                  {dayjs(a.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                </TableCell>
                <TableCell>
                  {dayjs(a.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={member.activityHistory.length}
          onPageChange={handlePageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
        />
      </CardContent>
    </Card>
  );
}
