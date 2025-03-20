import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { GridRowId } from "@mui/x-data-grid";
import { Control, Controller, useForm } from "react-hook-form";
import {
  useAccountByIdQuery,
  useAccountUpdateMutation,
  usePermissionListQuery,
} from "~/hooks/fetching/account/query";
interface DialogProps {
  id: GridRowId;
  open: boolean;
  setOpen: (value: boolean) => void;
}
const PermissionsSection = ({
  sectionName,
  permissions,
  control,
  accountId,
}: {
  sectionName: string;
  permissions: string[];
  accountId: string;
  control: Control<FormData, any>;
}) => {
  const accountQuery = useAccountByIdQuery(accountId);
  const account = accountQuery.data?.data;
  if (!account) return <></>;
  return (
    <Grid item xs={4}>
      <Typography variant="h6">{sectionName}</Typography>
      <Stack>
        {permissions.map((permission) => (
          <FormControl key={permission}>
            <FormControlLabel
              labelPlacement="end"
              control={
                <Controller
                  name={`permission.${permission}`}
                  control={control}
                  defaultValue={account.permission.includes(permission)}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      defaultChecked={account.permission.includes(permission)}
                      disabled={account.role === "admin"}
                    />
                  )}
                />
              }
              label={permission}
            />
          </FormControl>
        ))}
      </Stack>
    </Grid>
  );
};
interface FormData {
  email: string;
  role: "manager" | "member";
  permission: Record<string, boolean>;
}
export default function EditAccountDialog({ id, open, setOpen }: DialogProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>();
  const accountUpdateMutation = useAccountUpdateMutation();
  const permissionListQuery = usePermissionListQuery();
  const permissionList = permissionListQuery.data?.data;
  function onSubmit(data: FormData) {
    //Transform data.permission from Record<string, boolean> to an array of string that has true value
    const processedPerms = Object.keys(data.permission).filter(
      (key) => data.permission[key]
    );
    accountUpdateMutation.mutate({
      id: id as string,
      updateData: {
        ...data,
        permission: processedPerms,
      },
    });
    setOpen(false);
  }
  // Stop TS from complaining about id not being a string
  if (typeof id !== "string") return null;
  const accountQuery = useAccountByIdQuery(id);
  const account = accountQuery.data?.data;
  if (!account || !permissionList) return <></>;
  const groupedPermissions = groupPermission(permissionList);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Account</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Username"
                  value={account.username}
                  disabled
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  defaultValue={account.email}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "invalid email address",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => {
                    if (account.role === "admin") {
                      return (
                        <Select
                          label="Role"
                          disabled
                          {...field}
                          value={account.role}
                          fullWidth
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      );
                    }
                    return (
                      <Select
                        {...field}
                        label="Role"
                        defaultValue={account.role}
                        fullWidth
                      >
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="member">Member</MenuItem>
                      </Select>
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={2}>
                  <Divider />
                  <Typography variant="h6">Permission</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(groupedPermissions).map(
                      ([section, permissions]) => (
                        <PermissionsSection
                          key={section}
                          sectionName={
                            section.charAt(0).toUpperCase() + section.slice(1)
                          }
                          permissions={permissions}
                          control={control}
                          accountId={id}
                        />
                      )
                    )}
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
function groupPermission(permissionList: string[]) {
  const groupedPermissions: Record<string, string[]> = {};
  permissionList.forEach((permission) => {
    const section = permission.split(":")[0];
    if (!groupedPermissions[section]) {
      groupedPermissions[section] = [];
    }
    groupedPermissions[section].push(permission);
  });
  return groupedPermissions;
}
