import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { AccountRegister } from "~/hooks/fetching/account";
import { useCreateAccountAdminMutation } from "~/hooks/fetching/account/query";

export default function CreateNewAccountDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const registerMutation = useCreateAccountAdminMutation();
  async function onSubmit(data: AccountRegister) {
    registerMutation.mutate(data);
    setOpen(false);
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AccountRegister>();
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Create new account</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            {...register("username", {
              required: "Username is required",
            })}
            autoFocus
            label="Username"
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            margin="normal"
            type="password"
            fullWidth
            {...register("password", {
              required: "Password is required",
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            label="Password"
          />
          <TextField
            margin="normal"
            type="password"
            fullWidth
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value: string) => {
                if (watch("password") != value) {
                  return "Password does not match";
                }
              },
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            label="Confirm password"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "invalid email address",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
