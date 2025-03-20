import { styled, useTheme } from "@mui/material";

const PriorityChipRoot = styled("span")(
  ({ priority }: { priority: "low" | "medium" | "high" }) => {
    const theme = useTheme();
    const backgroundColor =
      priority === "low"
        ? theme.palette.success.main
        : priority === "medium"
        ? theme.palette.warning.main
        : theme.palette.error.main;
    const color =
      priority === "low"
        ? theme.palette.success.contrastText
        : priority === "medium"
        ? theme.palette.warning.contrastText
        : theme.palette.error.contrastText;
    return {
      alignItems: "center",
      backgroundColor,
      borderRadius: 12,
      color,
      cursor: "default",
      display: "inline-flex",
      flexGrow: 0,
      flexShrink: 0,
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.pxToRem(12),
      lineHeight: 2,
      fontWeight: 600,
      justifyContent: "center",
      letterSpacing: 0.5,
      minWidth: 20,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    };
  }
);
export default function PriorityChip({
  priority,
}: {
  priority: "low" | "medium" | "high";
}) {
  return <PriorityChipRoot priority={priority}>{priority}</PriorityChipRoot>;
}
