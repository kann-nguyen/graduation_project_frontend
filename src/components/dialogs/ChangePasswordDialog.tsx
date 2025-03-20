import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { ChangePassword } from "~/hooks/fetching/account";
import { useChangePasswordMutation } from "~/hooks/fetching/account/query";

export default function ChangePasswordDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChangePassword>();
  const changePasswordMut = useChangePasswordMutation();
  async function onSubmit(data: ChangePassword) {
    changePasswordMut.mutate(data, {
      onSuccess: (response) => {
        if (response.status === "success") setOpen(false);
      },
    });
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              type="password"
              label="Old Password"
              {...register("oldPassword", {
                required: "Old password is required",
              })}
              error={!!errors.oldPassword}
              helperText={errors.oldPassword?.message}
            />
            <TextField
              type="password"
              label="New Password"
              {...register("newPassword", {
                required: "New password is required",
              })}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
            <TextField
              type="password"
              label="Confirm Password"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value: string) => {
                  if (watch("newPassword") != value) {
                    return "Password does not match";
                  }
                },
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button color="success" type="submit">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
