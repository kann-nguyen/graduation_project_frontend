import {
  BugReport,
  Code,
  ContentPaste,
  GridView,
  Info,
  LibraryBooks,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Artifact, Vulnerability } from "~/hooks/fetching/artifact";
import { Threat } from "~/hooks/fetching/threat";
import { Docker } from "~/icons/Icons";
import ThreatDetailsDialog from "../dialogs/ThreatDetailsDialog";
interface VulnTabPanelProps {
  list: Vulnerability[];
  value: number;
  index: number;
  setOpenCweDetails: (value: boolean) => void;
}
interface ThreatTabPanelProps {
  list: Threat[];
  value: number;
  index: number;
}
function VulnTabPanel(props: VulnTabPanelProps) {
  const [, setSearchParams] = useSearchParams();
  const { list, value, index, setOpenCweDetails } = props;
  if (value !== index) return <></>;
  function viewCwe(cwe: string) {
    return () => {
      setSearchParams({ cweId: cwe });
      setOpenCweDetails(true);
    };
  }
  return (
    <List sx={{ overflowY: "scroll", height: "80%" }} dense>
      {list.map((item) => (
        <ListItem key={item._id}>
          <ListItemIcon>
            <BugReport />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body1">{item.cveId}</Typography>}
            secondary={
              <>
                <Typography variant="body2">
                  <b>Description: </b>
                  {item.description}
                </Typography>
                <Typography variant="body2">
                  <b>Score: </b>
                  {item.score}
                </Typography>
                <Typography variant="body2">
                  <b>Severity: </b>
                  {item.severity}
                </Typography>
                <Typography variant="body2">
                  <b>CWEs: </b>
                  {item.cwes.map((cwe) => (
                    <Box display="inline-flex" alignItems="center">
                      <Typography variant="body2">{cwe}</Typography>
                      <IconButton onClick={viewCwe(cwe)}>
                        <Info />
                      </IconButton>
                    </Box>
                  ))}
                </Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
function ThreatTabPanel(props: ThreatTabPanelProps) {
  const [, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const { list, value, index } = props;
  if (value !== index) return <></>;
  function viewThreatDetails(threatId: string) {
    return () => {
      setSearchParams({ threatId });
      setOpen(true);
    };
  }
  return (
    <List sx={{ overflowY: "scroll", height: "80%" }} dense>
      {list.map((item) => (
        <ListItem key={item._id}>
          <ListItemIcon>
            <BugReport />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body1">{item.name}</Typography>}
            secondary={
              <>
                <Typography variant="body2">
                  <b>Description: </b>
                  {item.description}
                </Typography>
                <Typography variant="body2">
                  <b>Score: </b>
                  {item.score.total}
                </Typography>
                <Typography variant="body2">
                  <b>Status: </b>
                  {item.status}
                </Typography>
              </>
            }
          />
          <ListItemSecondaryAction>
            <Button color="primary" onClick={viewThreatDetails(item._id)}>
              Details
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      <ThreatDetailsDialog open={open} setOpen={setOpen} />
    </List>
  );
}
function renderType({
  type,
}: {
  type: "image" | "log" | "source code" | "executable" | "library";
}) {
  switch (type) {
    case "image":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Image</Typography>
          <Docker />
        </Stack>
      );
    case "log":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Log</Typography>
          <ContentPaste />
        </Stack>
      );
    case "source code":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Code</Typography>
          <Code />
        </Stack>
      );
    case "executable":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Executable</Typography>
          <GridView />
        </Stack>
      );
    case "library":
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Library</Typography>
          <LibraryBooks />
        </Stack>
      );
  }
}
export default function ArtifactCard({
  artifacts,
  setOpenCweDetails,
}: {
  artifacts: Artifact[];
  setOpenCweDetails: (value: boolean) => void;
}) {
  const [activeTabs, setActiveTabs] = useState<number[]>(() =>
    Array(artifacts.length).fill(0)
  );
  function handleTabChange(index: number, newValue: number) {
    setActiveTabs((prevActiveTabs) => {
      const newActiveTabs = [...prevActiveTabs];
      newActiveTabs[index] = newValue;
      return newActiveTabs;
    });
  }
  return (
    <Card>
      <CardHeader title="Artifact vulnerabilities" />
      <CardContent>
        <Stack spacing={2}>
          {artifacts.map((artifact, index) => (
            <Box key={artifact._id}>
              <Stack
                direction="row"
                sx={{ height: 200 }}
                justifyContent="space-between"
              >
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Stack alignItems="center">
                    <Typography variant="h6" component="div">
                      {artifact.name}
                    </Typography>
                    <Typography color="text.secondary">
                      {renderType(artifact)}
                    </Typography>
                  </Stack>
                </Box>
                <Divider orientation="vertical" sx={{ mx: 2 }} />
                <Box flexGrow={1}>
                  <Tabs
                    value={activeTabs[index]}
                    onChange={(event, newValue) =>
                      handleTabChange(index, newValue)
                    }
                  >
                    <Tab label="Vulnerabilities" />
                    <Tab label="Threats" />
                  </Tabs>
                  <VulnTabPanel
                    value={activeTabs[index]}
                    index={0}
                    list={artifact.vulnerabilityList}
                    setOpenCweDetails={setOpenCweDetails}
                  />
                  <ThreatTabPanel
                    value={activeTabs[index]}
                    index={1}
                    list={artifact.threatList}
                  />
                </Box>
              </Stack>
              <Divider variant="middle" sx={{ m: 2 }} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
