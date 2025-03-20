import {
  Add,
  BugReport,
  ExpandMore,
  Reviews,
  Verified,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChangeEvent, useState } from "react";
import AddVulnResolutionDialog from "~/components/dialogs/AddVulnResolutionDialog";
import { Vulnerability } from "~/hooks/fetching/artifact";
import { Resolution } from "~/hooks/fetching/vuln";
import AvatarImage from "/avatar.webp";
import { useAccountContext, useUserRole } from "~/hooks/general";
import { useParams } from "react-router-dom";
import { useGetMembersOfProjectQuery } from "~/hooks/fetching/project/query";
import { useApproveResolutionMutation } from "~/hooks/fetching/vuln/query";
import ConfirmActionDialog from "../dialogs/ConfirmActionDialog";
dayjs.extend(relativeTime);
export default function VulnDetailsCard({
  vuln,
  resolution,
}: {
  vuln: Vulnerability;
  resolution?: Resolution;
}) {
  const [selectedCveId, setSelectedCveId] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containApprovedResolution = resolution?.resolution.find(
    (x) => x.isApproved
  );
  async function handleOpenDialog(cveId: string) {
    setSelectedCveId(cveId);
    setOpen(true);
  }
  return (
    <Card sx={{ m: 2 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <BugReport />
            <Typography display="inline" variant="h5" sx={{ ml: 1 }}>
              {vuln.cveId}
            </Typography>
          </Box>
        }
        action={
          containApprovedResolution && (
            <Stack direction="row" spacing={1}>
              <Typography display="inline">
                This vulnerability has approved resolution(s)
              </Typography>
              <Verified color="success" />
            </Stack>
          )
        }
      />
      <CardContent>
        <Typography variant="body1">
          <b>Description: </b>
          {vuln.description}
        </Typography>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Typography variant="body1">
          <b>Severity: </b>
          {vuln.severity}
        </Typography>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Typography variant="body1">
          <b>Score: </b>
          {vuln.score}
        </Typography>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Typography variant="body1">
          <b>CWEs: </b>
          {vuln.cwes.join(", ")}
        </Typography>
      </CardContent>
      <CardActions>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Button
            startIcon={<Add />}
            onClick={() => handleOpenDialog(vuln.cveId)}
          >
            Add resolution
          </Button>
          <Button
            startIcon={<Reviews />}
            endIcon={
              <ExpandMore
                sx={{
                  transform: !expanded ? "rotate(0deg)" : "rotate(180deg)",
                }}
              />
            }
            onClick={() => setExpanded(!expanded)}
          >
            View resolutions
          </Button>
        </Box>
      </CardActions>
      <ResolutionCollapse expanded={expanded} resolution={resolution} />
      <AddVulnResolutionDialog
        open={open}
        setOpen={setOpen}
        cveId={selectedCveId}
      />
    </Card>
  );
}
function ResolutionCollapse({
  expanded,
  resolution,
}: {
  expanded: boolean;
  resolution: Resolution | undefined;
}) {
  const pageSize = 3;
  const approveResolutionMutation = useApproveResolutionMutation();
  const userRole = useUserRole();
  const accountContext = useAccountContext();
  const { currentProject } = useParams();
  const [open, setOpen] = useState(false);
  const membersOfProjectQuery = useGetMembersOfProjectQuery(currentProject);
  const members = membersOfProjectQuery.data?.data
    ? membersOfProjectQuery.data.data
        .map((item) => item.account.username)
        .filter((item) => item !== accountContext.username)
    : [];
  const [page, setPage] = useState(1);
  const [resolutionId, setResolutionId] = useState("");
  function handlePageChange(event: ChangeEvent<unknown>, page: number) {
    setPage(page);
  }
  function approveResolution(resolutionId: string) {
    approveResolutionMutation.mutate(resolutionId);
  }
  function onClickApprove(resolutionId: string) {
    setOpen(true);
    setResolutionId(resolutionId);
  }
  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent>
        {resolution ? (
          <List>
            {resolution.resolution
              .slice(page - 1, Math.ceil(pageSize / page))
              .map((item, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar
                        src={AvatarImage}
                        sx={{
                          height: 40,
                          width: 40,
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.createdBy}
                      secondary={
                        <>
                          <Typography
                            sx={{ display: "inline" }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {item.description}
                          </Typography>
                        </>
                      }
                    />
                    {userRole === "manager" &&
                      members.includes(item.createdBy) && (
                        <Button
                          color="success"
                          onClick={() => onClickApprove(item._id)}
                          disabled={item.isApproved}
                        >
                          Approve this resolution
                        </Button>
                      )}
                    {item.isApproved && <Verified color="success" />}
                  </ListItem>
                  <ConfirmActionDialog
                    open={open}
                    setOpen={setOpen}
                    text="Are you sure you want to approve this resolution?"
                    callback={() => approveResolution(resolutionId)}
                  />
                  <Divider />
                </Box>
              ))}
            <Box
              sx={{ display: "flex", width: "100%", justifyContent: "center" }}
            >
              <Pagination
                count={Math.ceil(resolution.resolution.length / pageSize)}
                page={page}
                onChange={handlePageChange}
              />
            </Box>
          </List>
        ) : (
          <Typography variant="body1">
            No resolution found for this vulnerability
          </Typography>
        )}
      </CardContent>
    </Collapse>
  );
}
