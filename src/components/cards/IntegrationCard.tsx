import { BugReport, Edit, GitHub, Handyman, Tune } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import {
  bindMenu,
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useState } from "react";
import {
  useDisconnectFromGithubMutation,
  useDisconnectFromGitlabMutation,
} from "~/hooks/fetching/account/query";
import { useGetScanners } from "~/hooks/fetching/scanner/query";
import { useAccountContext, useUserRole } from "~/hooks/general";
import { GitLab } from "~/icons/Icons";
import AddNewToolDialog from "../dialogs/AddNewToolDialog";
import ConfirmActionDialog from "../dialogs/ConfirmActionDialog";
import EditScannerDialog from "../dialogs/EditScannerDialog";
import ImageScanningConfigDialog from "../dialogs/ImageScanningConfigDialog";
import UpdateAccessTokenDialog from "../dialogs/UpdateAccessTokenDialog";
import { useSearchParams } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function Integration() {
  const role = useUserRole();
  const [, setSearchParams] = useSearchParams();
  const account = useAccountContext();
  const scannersQuery = useGetScanners(account.username);
  const scanners = scannersQuery.data?.data ?? [];
  const github = account.thirdParty.find((t) => t.name === "Github");
  const gitlab = account.thirdParty.find((t) => t.name === "Gitlab");
  const [openEditScanner, setOpenEditScanner] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [openUpdateTokenGithub, setOpenUpdateTokenGithub] = useState(false);
  const [openUpdateTokenGitlab, setOpenUpdateTokenGitlab] = useState(false);
  const [openDisconnectGithub, setOpenDisconnectGithub] = useState(false);
  const [openDisconnectGitlab, setOpenDisconnectGitlab] = useState(false);
  const [openAddNew, setOpenAddNew] = useState(false);
  const disconnectFromGithubMutation = useDisconnectFromGithubMutation();
  const disconnectFromGitlabMutation = useDisconnectFromGitlabMutation();
  const theme = useTheme();
  const popupStateGithub = usePopupState({
    variant: "popover",
    popupId: "github",
  });
  const popupStateGitlab = usePopupState({
    variant: "popover",
    popupId: "gitlab",
  });
  const popupStateImageScanning = usePopupState({
    variant: "popover",
    popupId: "image-scanning",
  });
  function connectToGithub() {
    window.open(`${API_BASE_URL}account/connect/github`, "_self");
  }
  function connectToGitlab() {
    window.open(`${API_BASE_URL}account/connect/gitlab`, "_self");
  }
  function disconnectFromGithub() {
    disconnectFromGithubMutation.mutate();
  }
  function disconnectFromGitlab() {
    disconnectFromGitlabMutation.mutate();
  }
  function editScanner(id: string) {
    return () => {
      setSearchParams({ scannerId: id });
      setOpenEditScanner(true);
    };
  }
  return (
    <>
      <Card>
        <CardHeader title="Integration" />
        <CardContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <GitHub />
              </ListItemIcon>
              <ListItemText primary="Github" />
              <ListItemSecondaryAction>
                <IconButton edge="end" {...bindTrigger(popupStateGithub)}>
                  <Tune />
                </IconButton>
                <Popover
                  {...bindPopover(popupStateGithub)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                >
                  <Menu {...bindMenu(popupStateGithub)}>
                    {github ? (
                      <Box>
                        <MenuItem>
                          <Typography
                            sx={{ color: theme.palette.error.main }}
                            onClick={() => setOpenDisconnectGithub(true)}
                          >
                            Disconnect from Github
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => setOpenUpdateTokenGithub(true)}
                        >
                          <Typography>Update access token</Typography>
                        </MenuItem>
                      </Box>
                    ) : (
                      <Box>
                        <MenuItem onClick={connectToGithub}>
                          <Typography>Connect to Github</Typography>
                        </MenuItem>
                        <MenuItem disabled>
                          <Typography>Update access token</Typography>
                        </MenuItem>
                      </Box>
                    )}
                  </Menu>
                </Popover>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GitLab />
              </ListItemIcon>
              <ListItemText primary="Gitlab" />
              <ListItemSecondaryAction>
                <IconButton edge="end" {...bindTrigger(popupStateGitlab)}>
                  <Tune />
                </IconButton>
                <Popover
                  {...bindPopover(popupStateGitlab)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                >
                  <Menu {...bindMenu(popupStateGitlab)}>
                    {gitlab ? (
                      <Box>
                        <MenuItem>
                          <Typography
                            sx={{ color: theme.palette.error.main }}
                            onClick={() => setOpenDisconnectGitlab(true)}
                          >
                            Disconnect from Gitlab
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => setOpenUpdateTokenGitlab(true)}
                        >
                          <Typography>Update access token</Typography>
                        </MenuItem>
                      </Box>
                    ) : (
                      <Box>
                        <MenuItem onClick={connectToGitlab}>
                          <Typography>Connect to Gitlab</Typography>
                        </MenuItem>
                        <MenuItem disabled>
                          <Typography>Update access token</Typography>
                        </MenuItem>
                      </Box>
                    )}
                  </Menu>
                </Popover>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            {role === "manager" && (
              <ListItem>
                <ListItemIcon>
                  <BugReport />
                </ListItemIcon>
                <ListItemText primary="Image scanning tool" />
                <ListItemSecondaryAction>
                  <IconButton
                    {...bindTrigger(popupStateImageScanning)}
                    edge="end"
                  >
                    <Tune />
                  </IconButton>
                  <Popover
                    {...bindPopover(popupStateImageScanning)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                  >
                    <Menu {...bindMenu(popupStateImageScanning)}>
                      <MenuItem onClick={() => setOpenConfig(true)}>
                        Configure
                      </MenuItem>
                      <MenuItem onClick={() => setOpenAddNew(true)}>
                        Add a new tool
                      </MenuItem>
                    </Menu>
                  </Popover>
                </ListItemSecondaryAction>
              </ListItem>
            )}
            {scanners.map((scanner) => (
              <ListItem key={scanner.name} sx={{ mx: 3 }}>
                <ListItemIcon>
                  <Handyman />
                </ListItemIcon>
                <ListItemText primary={scanner.name} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={editScanner(scanner._id)}>
                    <Edit />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <UpdateAccessTokenDialog
        open={openUpdateTokenGithub}
        setOpen={setOpenUpdateTokenGithub}
        thirdParty={github}
      />
      <UpdateAccessTokenDialog
        open={openUpdateTokenGitlab}
        setOpen={setOpenUpdateTokenGitlab}
        thirdParty={gitlab}
      />
      <ConfirmActionDialog
        open={openDisconnectGithub}
        setOpen={setOpenDisconnectGithub}
        text="Are you sure you want to disconnect from Github?"
        callback={disconnectFromGithub}
      />
      <ConfirmActionDialog
        open={openDisconnectGitlab}
        setOpen={setOpenDisconnectGitlab}
        text="Are you sure you want to disconnect from Gitlab?"
        callback={disconnectFromGitlab}
      />
      <ImageScanningConfigDialog open={openConfig} setOpen={setOpenConfig} />
      <EditScannerDialog open={openEditScanner} setOpen={setOpenEditScanner} />
      <AddNewToolDialog open={openAddNew} setOpen={setOpenAddNew} />
    </>
  );
}
