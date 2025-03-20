import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useUpdateWorkflowMutation } from "~/hooks/fetching/workflow/query";
import { Branch } from "~/icons/Icons";
import { Workflow } from "~/hooks/fetching/workflow";

interface Props {
  workflow: Workflow;
  open: boolean;
  setOpen: (open: boolean) => void;
}
interface FormData {
  branch: string;
  branchSelection: "default" | "new";
  message: string;
}
export default function CommitScriptChange({ workflow, open, setOpen }: Props) {
  const updateWorkflowMutation = useUpdateWorkflowMutation();
  const { currentProject } = useParams();
  const { register, handleSubmit, control, watch } = useForm<FormData>({
    defaultValues: {
      branch: undefined,
      message: `Update ${workflow.name} workflow`,
    },
  });
  const watchSelection = watch("branchSelection");
  function onSubmit(data: FormData) {
    const { branch, message } = data;
    updateWorkflowMutation.mutate({
      branch,
      data: workflow,
      message,
      projectName: currentProject,
    });
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Commit changes</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Commit message"
              fullWidth
              {...register("message")}
            />
            <Controller
              name="branchSelection"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field}>
                  <FormControlLabel
                    control={<Radio />}
                    label="Commit directly to default branch (master/main)"
                    value="default"
                  />
                  <FormControlLabel
                    control={<Radio />}
                    label="Create a new branch for this commit"
                    value="new"
                  />
                </RadioGroup>
              )}
            />
            {watchSelection === "new" && (
              <TextField
                {...register("branch")}
                label="Branch name"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Branch />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="success">
            Commit changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
