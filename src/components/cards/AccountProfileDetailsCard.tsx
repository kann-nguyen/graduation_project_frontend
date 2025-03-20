import { Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  SxProps,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import {
  useUpdateUserMutation,
  useUserByAccountIdQuery,
} from "~/hooks/fetching/user/query";
interface FormData {
  name: string;
  email: string;
}
export default function AccountProfileDetails({ sx }: { sx?: SxProps }) {
  const userInfoQuery = useUserByAccountIdQuery();
  const updateUserMutation = useUpdateUserMutation();
  const user = userInfoQuery.data?.data;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: user?.name,
      email: user?.account.email,
    },
  });
  if (!user) return <></>;
  function onSubmit(data: FormData) {
    updateUserMutation.mutate(data);
  }
  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card sx={sx}>
        <CardHeader title="Profile" />
        <CardContent>
          <Box>
            <Grid container spacing={1}>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register("name", { required: "Name is required" })}
                  fullWidth
                  label="Name"
                  defaultValue={user.name}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  disabled
                  defaultValue={user.account.username}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register("email", { required: "Email is required" })}
                  fullWidth
                  label="Email"
                  defaultValue={user.account.email}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <Divider sx={{ py: 2 }} />
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button variant="contained" type="submit" endIcon={<Save />}>
            Save details
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
