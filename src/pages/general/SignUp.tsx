import { AccountCircle } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  ThemeProvider,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AccountRegister } from "~/hooks/fetching/account";
import axios from "axios";
import api from "~/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  async function onSubmit(data: AccountRegister) {
    setIsSubmitting(true);
    console.log("Form data being submitted:", data);
    
    try {
      // Simplified direct API call instead of using the mutation
      const response = await api.post("/account/reg", data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Registration response:", response);
      setSuccessMessage("Account created successfully!");
      
      // Show success message then redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMsg = error?.response?.data?.message || "Registration failed. Please try again.";
      setErrorMessage(errorMsg);
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  
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
          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              {successMessage}
            </Alert>
          )}
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
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters"
                },
                pattern: {
                  value: /^[a-zA-Z0-9_-]+$/,
                  message: "Username can only contain letters, numbers, underscores and hyphens"
                }
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
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
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
                  message: "Invalid email address",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <FormControl fullWidth margin="normal" error={!!errors.role}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                label="Role"
                defaultValue="member"
                {...register("role")}
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="project_manager">Project Manager</MenuItem>
                <MenuItem value="security_expert">Security Expert</MenuItem>
              </Select>
              {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>
            <Box textAlign="center" mt={2}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
