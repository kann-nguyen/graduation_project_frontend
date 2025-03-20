import { AccountCircle } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  ThemeProvider,
  Typography,
  useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { AccountRegister } from "~/hooks/fetching/account";
import { useCreateAccountMutation } from "~/hooks/fetching/auth/query";
export default function SignUp() {
  const registerMutation = useCreateAccountMutation();
  async function onSubmit(data: AccountRegister) {
    registerMutation.mutate(data);
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AccountRegister>();
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <AccountCircle />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
