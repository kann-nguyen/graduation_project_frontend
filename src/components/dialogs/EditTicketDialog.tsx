import { AccountCircle } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Ticket, TicketUpdate } from "~/hooks/fetching/ticket";
import { useUpdateTicketMutation } from "~/hooks/fetching/ticket/query";
import { useGetMembersOfProjectQuery } from "~/hooks/fetching/project/query";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  ticket: Ticket;
}

export default function EditTicketDialog({ open, setOpen, ticket }: Props) {
  const { currentProject } = useParams();
  const memberInfoQuery = useGetMembersOfProjectQuery(currentProject);
  const updateTicketMutation = useUpdateTicketMutation();
  const memberInfo = memberInfoQuery.data?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset
  } = useForm<TicketUpdate>({
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      assignee: ticket.assignee?._id || ""
    }
  });

  // Reset form when dialog opens or ticket changes
  useEffect(() => {
    if (open) {
      reset({
        title: ticket.title,
        description: ticket.description,
        assignee: ticket.assignee?._id || ""
      });
    }
  }, [open, ticket, reset]);

  async function submit(data: TicketUpdate) {
    if (!currentProject) return;
    
    updateTicketMutation.mutate({ 
      id: ticket._id, 
      data 
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <Box component="form" onSubmit={handleSubmit(submit)}>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              {...register("title", {
                required: "Title is required",
              })}
              label="Title"
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message || "Enter a concise title for the ticket"}
            />
            
            <TextField
              {...register("description", {
                required: "Description is required",
              })}
              label="Description"
              fullWidth
              multiline
              minRows={4}
              error={!!errors.description}
              helperText={errors.description?.message || "Enter a detailed description of the ticket"}
            />
            
            <Controller
              name="assignee"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Assignee</InputLabel>
                  <Select {...field} label="Assignee">
                    <MenuItem value="">
                      <em>Unassigned</em>
                    </MenuItem>
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
                  {errors.assignee && (
                    <FormHelperText error>{errors.assignee.message}</FormHelperText>
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
          <Button 
            type="submit" 
            variant="contained"
            disabled={updateTicketMutation.isLoading}
          >
            {updateTicketMutation.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}