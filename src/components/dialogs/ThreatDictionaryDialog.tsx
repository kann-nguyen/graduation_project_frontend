import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useThreatsQuery } from "~/hooks/fetching/threat/query";

export default function ThreatDictionaryDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const threatsQuery = useThreatsQuery();
  const threats = threatsQuery.data?.data ?? [];
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 400 },
    { field: "description", headerName: "Description", minWidth: 400, flex: 1 },
    {
      field: "score",
      headerName: "Total score (D-R-E-A-D)",
      valueGetter: ({
        row: {
          score: { total, details },
        },
      }) =>
        `${total} (${details.damage} - ${details.reproducibility} - ${details.exploitability} - ${details.affectedUsers} - ${details.discoverability})`,
      width: 200,
    },
  ];
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xl">
      <DialogTitle>Threat Dictionary</DialogTitle>
      <DialogContent>
        <DataGrid
          rows={threats}
          columns={columns}
          autoHeight
          getRowId={(row) => row._id}
        />
      </DialogContent>
    </Dialog>
  );
}
