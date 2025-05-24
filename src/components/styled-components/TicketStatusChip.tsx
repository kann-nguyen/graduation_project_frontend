import { Done, Pending, ErrorOutline, CheckCircle } from "@mui/icons-material";
import { Chip, Tooltip, useTheme } from "@mui/material";

export default function TicketStatusChip({ status, size = "small" }: { status: string; size?: "small" | "medium" | "large" }) {
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
        size={size === "large" ? "medium" : "small"}
        sx={{
          '& .MuiChip-icon': {
            fontSize: size === "large" ? '1.3rem' : '1rem',
            mr: size === "large" ? 0.5 : -0.5
          },
          fontSize: size === "large" ? '1.05rem' : undefined,
          height: size === "large" ? 40 : undefined,
          fontWeight: size === "large" ? 600 : 500,          borderWidth: size === "large" ? 2 : 1,
          borderStyle: 'solid',
          borderColor: color === 'default' 
            ? theme.palette.grey[300] 
            : theme.palette[color].main,
          boxShadow: size === "large" 
            ? `0 2px 8px rgba(0,0,0,0.08)` 
            : 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: color === 'default' 
              ? `0 0 0 1px ${theme.palette.grey[500]}` 
              : `0 0 0 2px ${theme.palette[color].light}`
          }
        }}
      />
    </Tooltip>
  );
}
