import { Flag, FlagOutlined } from "@mui/icons-material";
import { Chip, Tooltip, useTheme } from "@mui/material";

const priorityConfig: Record<
  "low" | "medium" | "high",
  {
    color: "success" | "warning" | "error";
    icon: JSX.Element;
    tooltip: string;
  }
> = {
  low: {
    color: "success",
    icon: <FlagOutlined fontSize="small" />,
    tooltip: "Low priority task"
  },
  medium: {
    color: "warning",
    icon: <Flag fontSize="small" />,
    tooltip: "Medium priority task"
  },
  high: {
    color: "error",
    icon: <Flag fontSize="small" />,
    tooltip: "High priority task - needs immediate attention"
  }
};

export default function PriorityChip({
  priority,
}: {
  priority: "low" | "medium" | "high";
}) {
  const theme = useTheme();
  const config = priorityConfig[priority];

  return (
    <Tooltip title={config.tooltip} arrow>
      <Chip
        label={priority}
        color={config.color as "success" | "warning" | "error"}
        icon={config.icon}
        size="small"
        sx={{
          textTransform: 'capitalize',
          fontWeight: 500,
          '& .MuiChip-icon': {
            fontSize: '1rem',
            mr: -0.5
          },
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: `0 0 0 1px ${theme.palette[config.color].main}`
          }
        }}
      />
    </Tooltip>
  );
}
