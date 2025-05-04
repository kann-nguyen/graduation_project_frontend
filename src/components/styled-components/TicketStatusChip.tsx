import { Done, Pending, ErrorOutline, CheckCircle } from "@mui/icons-material";
import { Chip, PaletteColor, Tooltip, useTheme } from "@mui/material";

export default function TicketStatusChip({ status }: { status: string }) {
  const theme = useTheme();
  
  const statusConfig: Record<string, {
    label: string;
    color: "default" | "primary" | "secondary" | "success" | "warning" | "error";
    icon: React.ReactElement;
    tooltip: string;
  }> = {
    "Not accepted": { 
      label: "Not Accepted", 
      color: "default",
      icon: <ErrorOutline fontSize="small" />,
      tooltip: "This ticket hasn't been accepted yet"
    },
    "Processing": { 
      label: "Processing", 
      color: "warning",
      icon: <Pending fontSize="small" />,
      tooltip: "This ticket is currently being worked on"
    },
    "Submitted": { 
      label: "Submitted", 
      color: "primary",
      icon: <Done fontSize="small" />,
      tooltip: "This ticket has been submitted for review"
    },
    "Resolved": { 
      label: "Resolved", 
      color: "success",
      icon: <CheckCircle fontSize="small" />,
      tooltip: "This ticket has been resolved"
    }
  };

  const { label, color, icon, tooltip } = statusConfig[status] || { 
    label: "Unknown", 
    color: "default",
    icon: <ErrorOutline fontSize="small" />,
    tooltip: "Unknown status"
  };

  return (
    <Tooltip title={tooltip} arrow>
      <Chip 
        label={label} 
        color={color} 
        icon={icon}
        sx={{
          '& .MuiChip-icon': {
            fontSize: '1rem',
            mr: -0.5
          },
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: `0 0 0 1px ${
              color === 'default' 
                ? theme.palette.grey[500] 
                : (theme.palette[color] as PaletteColor).main
            }`
          }
        }}
      />
    </Tooltip>
  );
}
