import { Close, Done } from "@mui/icons-material";
import { Chip, useTheme } from "@mui/material";

export default function TicketStatusChip({
  status,
}: {
  status: "open" | "closed";
}) {
  const theme = useTheme();
  const getSxProps = (status: "open" | "closed") => {
    if (status === "open") {
      return {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
      };
    }
    return {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    };
  };

  const getStatusLabel = () => {
    if (status === "open") {
      return "Open";
    }
    return "Closed";
  };

  const getIcon = () => {
    if (status === "open") {
      return <Done />;
    }
    return <Close color="secondary" />;
  };

  return (
    <Chip label={getStatusLabel()} icon={getIcon()} sx={getSxProps(status)} />
  );
}
