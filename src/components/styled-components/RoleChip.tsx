import { Chip } from "@mui/material";

export default function RoleChip({
  role,
}: {
  role: "admin" | "project_manager" | "security_expert" | "member";
}) {
  switch (role) {
    case "admin":
      return <Chip label="Admin" color="primary" />;
    case "project_manager":
      return <Chip label="Project Manager" color="secondary" />;
    case "security_expert":
      return <Chip label="Security Expert" color="warning" />;
    case "member":
      return <Chip label="Member" color="success" />;
  }
}
