import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ItemProps } from "./Sidebar";

export function Item({ text, icon, path }: ItemProps) {
  const navigate = useNavigate();
  return (
    <ListItemButton
      onClick={() => {
        navigate(path);
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItemButton>
  );
}
