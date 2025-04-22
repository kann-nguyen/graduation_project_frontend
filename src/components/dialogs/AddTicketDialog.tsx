import { AccountCircle, BugReport } from "@mui/icons-material";
import {
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
import { ChangeEvent, HTMLAttributes, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Threat } from "~/hooks/fetching/threat";
import { TicketCreate } from "~/hooks/fetching/ticket";
import { useCreateTicketMutation } from "~/hooks/fetching/ticket/query";
import { useGetMembersOfProjectQuery } from "~/hooks/fetching/project/query";
import { useAccountContext } from "~/hooks/general";
import { useThreatsQuery } from "~/hooks/fetching/threat/query";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function ThreatOption({
  props,
  option,
}: {
  props: HTMLAttributes<HTMLLIElement>;
  option: Threat;
}) {
  return (
    <ListItem {...props} key={option._id}>
      <ListItemIcon>
        <BugReport />
      </ListItemIcon>
      <ListItemText
        primary={<Typography variant="body1">{option.name}</Typography>}
        secondary={
          <>
            <Typography variant="body2">
              <b>Description:</b> {option.description}
            </Typography>
            <Typography variant="body2">
              <b>Score:</b> {option.score.total}
            </Typography>
            <Typography variant="body2">
              <b>Type:</b> {option.type}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
}

export default function AddTicketDialog({ open, setOpen }: Props) {
  const { currentProject } = useParams();
  const memberInfoQuery = useGetMembersOfProjectQuery(currentProject);
  const createTicketMutation = useCreateTicketMutation();
  const memberInfo = memberInfoQuery.data?.data ?? [];
  const accountInfo = useAccountContext();
  const threatsQuery = useThreatsQuery();
  const threats = threatsQuery.data?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<TicketCreate>();

  const [selectedPriority, setSelectedPriority] = useState<"Low" | "Medium" | "High">("Low");

  function selectPriority(event: ChangeEvent<HTMLInputElement>) {
    setSelectedPriority(
      (event.target as HTMLInputElement).value as "Low" | "Medium" | "High"
    );
  }

  async function submit(data: TicketCreate) {
    if (!accountInfo || !currentProject) return;
    const priority = selectedPriority.toLowerCase() as "low" | "medium" | "high";
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
            <Box display="flex" justifyContent="space-between" alignItems="center">
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
            <Box display="flex" justifyContent="space-between" alignItems="center">
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
              name="assignee"
              control={control}
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
              name="targetedThreat"
              rules={{ required: "Select a threat" }}
              render={({ field: { onChange, value } }) => (
                <FormControl>
                  <InputLabel>Threat</InputLabel>
                  <Select 
                    value={value || ''} 
                    onChange={onChange}
                    label="Threat"
                    error={!!errors.targetedThreat}
                  >
                    {threats.map((threat) => (
                      <MenuItem key={threat._id} value={threat._id}>
                        <ListItem>
                          <ListItemIcon>
                            <BugReport />
                          </ListItemIcon>
                          <ListItemText 
                            primary={threat.name}
                            secondary={`Type: ${threat.type} | Score: ${threat.score.total}`}
                          />
                        </ListItem>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.targetedThreat && (
                    <FormHelperText error>
                      {errors.targetedThreat.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
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
