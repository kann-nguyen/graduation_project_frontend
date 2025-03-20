import { MoreVert } from "@mui/icons-material";
import {
  Card,
  CardContent,
  IconButton,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Phase } from "~/hooks/fetching/phase";

export default function PhaseBoard({
  phases,
  sx,
}: {
  phases: Phase[];
  sx?: SxProps;
}) {
  const navigate = useNavigate();
  function visitDetails(phaseId: string) {
    return () => {
      navigate(`${phaseId}`);
    };
  }
  return (
    <Card sx={sx}>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell>Artifacts</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {phases.map((phase) => (
              <TableRow key={phase._id}>
                <TableCell>{phase.name}</TableCell>
                <TableCell>{phase.description}</TableCell>
                <TableCell>{phase.tasks.length}</TableCell>
                <TableCell>{phase.artifacts.length}</TableCell>
                <TableCell>
                  <IconButton onClick={visitDetails(phase._id)}>
                    <MoreVert fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
