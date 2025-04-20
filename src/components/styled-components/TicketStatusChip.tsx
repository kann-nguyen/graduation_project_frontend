import { Close, Done } from "@mui/icons-material";
import { Chip, useTheme } from "@mui/material";

export default function TicketStatusChip({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: "default" | "primary" | "secondary" | "success" | "warning" | "error" }> = {
    "Not accepted": { label: "Not Accepted", color: "default" },
    Processing: { label: "Processing", color: "warning" },
    Submitted: { label: "Submitted", color: "primary" },
    Resolved: { label: "Resolved", color: "success" },
  };

  const { label, color } = statusMap[status] || { label: "Unknown", color: "default" };

  return <Chip label={label} color={color} />;
}
