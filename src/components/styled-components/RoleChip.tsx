import { Chip } from "@mui/material";

export default function RoleChip({
  role,
}: {
  role: "admin" | "manager" | "member";
}) {
  switch (role) {
    case "admin":
      return <Chip label="Admin" color="primary" />;
    case "manager":
      return <Chip label="Manager" color="secondary" />;
    case "member":
      return <Chip label="Member" color="success" />;
  }
}
