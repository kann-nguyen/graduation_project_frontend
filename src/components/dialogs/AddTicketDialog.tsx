import { AccountCircle, BugReport } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, HTMLAttributes, SyntheticEvent, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Vulnerability } from "~/hooks/fetching/artifact";
import { useArtifactsQuery } from "~/hooks/fetching/artifact/query";
import { TicketCreate } from "~/hooks/fetching/ticket";
import { useCreateTicketMutation } from "~/hooks/fetching/ticket/query";
import { useGetMembersOfProjectQuery } from "~/hooks/fetching/project/query";
import { useAccountContext } from "~/hooks/general";
interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export default function AddTicketDialog({ open, setOpen }: Props) {
  const [recommendedPriority, setRecommendedPriority] = useState("");
  const { currentProject } = useParams();
  const getAllArtifactsQuery = useArtifactsQuery(currentProject);
  const artifacts = getAllArtifactsQuery.data?.data;
  const vulns =
    artifacts?.flatMap((artifact) => artifact.vulnerabilityList) ?? [];
  const memberInfoQuery = useGetMembersOfProjectQuery(currentProject);
  const createTicketMutation = useCreateTicketMutation();
  const memberInfo = memberInfoQuery.data?.data ?? [];
  const accountInfo = useAccountContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<TicketCreate>();
  const [selectedPriority, setSelectedPriority] = useState<
    "Low" | "Medium" | "High"
  >("Low");
  function selectPriority(event: ChangeEvent<HTMLInputElement>) {
    setSelectedPriority(
      (event.target as HTMLInputElement).value as "Low" | "Medium" | "High"
    );
  }
  function captureVulnsSeverity(
    event: SyntheticEvent<Element, Event>,
    data: Vulnerability[],
    onChange: (...event: any[]) => void
  ) {
    const severities = data.map((vuln) => vuln.severity.toLowerCase());
    if (severities.includes("high") || severities.includes("critical")) {
      setValue("priority", "high");
    } else if (severities.includes("medium")) {
      setValue("priority", "medium");
    } else {
      setValue("priority", "low");
    }
    onChange(data);
  }
  async function submit(data: TicketCreate) {
    if (!accountInfo || !currentProject) return;
    const priority = selectedPriority.toLowerCase() as
      | "low"
      | "medium"
      | "high";
    const ticket = {
      ...data,
      priority,
      projectName: currentProject,
    };
    createTicketMutation.mutate(ticket);
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <Box component="form" onSubmit={handleSubmit(submit)}>
        <DialogTitle>Create a new ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body1">Title</Typography>
              <TextField
                {...register("title", {
                  required: "Title is required",
                })}
                label="Title"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Box>
            <TextField
              {...register("description", {
                required: "Description is required",
              })}
              label="Description"
              fullWidth
              multiline
              minRows={5}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body1">Priority</Typography>
              <Controller
                name="priority"
                control={control}
                defaultValue="low"
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    {["low", "medium", "high"].map((item) => (
                      <FormControlLabel
                        key={item}
                        value={item}
                        control={<Radio />}
                        label={item.charAt(0).toUpperCase() + item.slice(1)}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            </Box>
            <TextField
              label="Assigner"
              defaultValue={accountInfo?.username}
              disabled
            />
            <Controller
              control={control}
              name="assignee"
              rules={{ required: "Assignee is required" }}
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Assignee</InputLabel>
                  <Select {...field} label="Assignee">
                    {memberInfo.map((member) => (
                      <MenuItem key={member._id} value={member._id}>
                        <ListItem>
                          <ListItemIcon>
                            <AccountCircle />
                          </ListItemIcon>
                          <ListItemText primary={member.account.username} />
                        </ListItem>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            {errors.assignee && (
              <FormHelperText error>{errors.assignee.message}</FormHelperText>
            )}
            <Controller
              control={control}
              name="targetedVulnerability"
              rules={{ required: "Select at least one vulnerability" }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={vulns}
                  onChange={(event, data) =>
                    captureVulnsSeverity(event, data, onChange)
                  }
                  renderOption={(props, option) => (
                    <VulnOption props={props} option={option} />
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Vulnerability" />
                  )}
                  getOptionLabel={(option) => option.cveId}
                />
              )}
            />
            {errors.targetedVulnerability && (
              <FormHelperText error>
                {errors.targetedVulnerability.message}
              </FormHelperText>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
function VulnOption({
  props,
  option,
}: {
  props: HTMLAttributes<HTMLLIElement>;
  option: Vulnerability;
}) {
  return (
    <ListItem {...props} key={option._id}>
      <ListItemIcon>
        <BugReport />
      </ListItemIcon>
      <ListItemText
        primary={<Typography variant="body1">{option.cveId}</Typography>}
        secondary={
          <>
            <Typography variant="body2">
              <b>Description:</b> {option.description}
            </Typography>
            <Typography variant="body2">
              <b>Score:</b> {option.score}
            </Typography>
            <Typography variant="body2">
              <b>Severity:</b> {option.severity}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
}
