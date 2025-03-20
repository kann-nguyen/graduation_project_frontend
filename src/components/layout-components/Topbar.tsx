import {
  AccountCircleOutlined,
  Add,
  Book,
  ExpandMore,
  LogoutOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  AppBarProps,
  Dialog,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ImportProject from "~/components/dialogs/ImportProjectDialog";
import { getAccountInfo } from "~/hooks/fetching/account/axios";
import { logout } from "~/hooks/fetching/auth/axios";
import { useProjectInQuery } from "~/hooks/fetching/user/query";
import { useUserRole } from "~/hooks/general";
export default function Topbar() {
  const navigate = useNavigate();
  const role = useUserRole();
  const location = useLocation();
  const shouldProjectSelectRender =
    !location.pathname.includes("user") && role !== "admin";
  const { currentProject } = useParams();
  const [openDialog, setOpenDialog] = useState(false);
  const projectInQuery = useProjectInQuery();
  const projects = projectInQuery.data?.data;
  async function handleLogOut() {
    logout();
    navigate("/login", { replace: true });
  }
  async function redirectToAccountPage() {
    const account = await getAccountInfo();
    const { data } = account;
    if (!data) return;
    const { username } = data;
    navigate(`/user/${username}`);
  }
  function switchProject(event: SelectChangeEvent<string>, child: ReactNode) {
    const selection = event.target.value;
    const encoded = encodeURIComponent(selection);
    if (selection === "add-new-project") {
      setOpenDialog(true);
      return;
    }
    navigate(`/${encoded}/`);
  }
  return (
    <AppBar
      position="absolute"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
          Dashboard
        </Typography>
        <FormControl sx={{ px: 1 }}>
          <InputLabel sx={{ color: "white" }}>Project</InputLabel>
          {shouldProjectSelectRender && (
            <Select
              label="Project"
              IconComponent={() => <ExpandMore color="inherit" />}
              sx={{ minWidth: 200, color: "info" }}
              onChange={switchProject}
              value={currentProject}
            >
              {projects?.map((project) => (
                <MenuItem key={project._id} value={project.name}>
                  <Stack direction="row" alignItems="center">
                    <Book fontSize="small" />
                    <Typography>{project.name}</Typography>
                  </Stack>
                </MenuItem>
              ))}
              <MenuItem
                key="add-project"
                value="add-new-project"
                disabled={role !== "manager"}
              >
                <Stack direction="row" alignItems="center">
                  <Add fontSize="small" />
                  <Typography>Add new project</Typography>
                </Stack>
              </MenuItem>
            </Select>
          )}
        </FormControl>
        <Tooltip
          title="Account"
          sx={{ display: role === "admin" ? "none" : "inline-flex" }}
        >
          <IconButton onClick={redirectToAccountPage}>
            <AccountCircleOutlined color="secondary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogOut}>
            <LogoutOutlined color="secondary" />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <ImportProject setClose={() => setOpenDialog(false)} />
      </Dialog>
    </AppBar>
  );
}
