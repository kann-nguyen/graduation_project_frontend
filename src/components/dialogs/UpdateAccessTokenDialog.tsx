import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ThirdParty } from "~/hooks/fetching/account";
import {
  useUpdateGithubAccessTokenMutation,
  useUpdateGitlabAccessTokenMutation,
} from "~/hooks/fetching/account/query";
export default function UpdateAccessTokenDialog({
  thirdParty,
  setOpen,
  open,
}: {
  thirdParty: ThirdParty | undefined;
  setOpen: (open: boolean) => void;
  open: boolean;
}) {
  const updateGithubTokenMutation = useUpdateGithubAccessTokenMutation();
  const updateGitlabTokenMutation = useUpdateGitlabAccessTokenMutation();
  const [isTokenShown, setIsTokenShown] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ accessToken: string }>();
  async function onSubmit(data: { accessToken: string }) {
    if (thirdParty?.name === "Github") {
      updateGithubTokenMutation.mutate(data.accessToken);
    } else if (thirdParty?.name === "Gitlab") {
      updateGitlabTokenMutation.mutate(data.accessToken);
    }
    setOpen(false);
  }
  return (
    <Dialog open={open} fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Update access token</DialogTitle>
        <DialogContent>
          <TextField
            type={isTokenShown ? "text" : "password"}
            defaultValue={thirdParty?.accessToken}
            {...register("accessToken", {
              required: "Access token is required",
            })}
            error={errors.accessToken !== undefined}
            helperText={errors.accessToken?.message}
            fullWidth
            label="Access token"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setIsTokenShown(!isTokenShown)}>
                    {isTokenShown ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button type="submit">Update</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
