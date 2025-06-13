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
import { useEffect } from "react";
import {
  useAccountByIdQuery,
  useAccountUpdateMutation,
  usePermissionListQuery,
} from "~/hooks/fetching/account/query";
import { useUserByAccountIdQuery, useAdminUpdateUserMutation, useUserQuery, useGetAllUsersQuery } from "~/hooks/fetching/user/query";
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
              control={                  <Controller
                    name={`permission.${permission}`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value || false}
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

const SkillsSection = ({
  control,
  userId,
}: {
  userId: string;
  control: Control<FormData, any>;
}) => {
  const userQuery = useUserQuery(userId);
  const user = userQuery.data?.data;
  
  const strideSkills = [
    "Spoofing",
    "Tampering", 
    "Repudiation",
    "Information Disclosure",
    "Denial of Service",
    "Elevation of Privilege",
  ];

  if (!user) return <></>;
  
  return (
    <>
      <Typography variant="h6">Skills</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select the STRIDE threat types this user is skilled in for ticket assignment suggestions.
      </Typography>
      <Grid container spacing={2}>
        {strideSkills.map((skill) => (
          <Grid item xs={4} key={skill}>
            <FormControl>
              <FormControlLabel
                labelPlacement="end"
                control={                  <Controller
                    name={`skills.${skill}`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value || false}
                      />
                    )}
                  />
                }
                label={skill}
              />
            </FormControl>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

interface FormData {
  email: string;
  role: "admin" | "project_manager" | "security_expert" | "member";
  permission: Record<string, boolean>;
  skills: Record<string, boolean>;
}
export default function EditAccountDialog({ id, open, setOpen }: DialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const accountUpdateMutation = useAccountUpdateMutation();
  const adminUpdateUserMutation = useAdminUpdateUserMutation();
  const permissionListQuery = usePermissionListQuery();
  const permissionList = permissionListQuery.data?.data;
  
  // Stop TS from complaining about id not being a string
  if (typeof id !== "string") return null;
  
  const accountQuery = useAccountByIdQuery(id);
  const account = accountQuery.data?.data;
  
  // Get user data using the account ID
  const userQuery = useUserByAccountIdQuery();
  const allUsersQuery = useGetAllUsersQuery();
  const currentUser = allUsersQuery.data?.data?.find(user => user.account._id === id);

  // Reset form when dialog opens or data changes
  useEffect(() => {
    if (open && account && currentUser && permissionList) {
      // Prepare permission values
      const permissionValues: Record<string, boolean> = {};
      permissionList.forEach(permission => {
        permissionValues[permission] = account.permission.includes(permission);
      });

      // Prepare skills values
      const skillsValues: Record<string, boolean> = {};
      const strideSkills = [
        "Spoofing",
        "Tampering", 
        "Repudiation",
        "Information Disclosure",
        "Denial of Service",
        "Elevation of Privilege",
      ];
      strideSkills.forEach(skill => {
        skillsValues[skill] = currentUser.skills?.includes(skill as any) || false;
      });

      reset({
        email: account.email,
        role: account.role,
        permission: permissionValues,
        skills: skillsValues,
      });
    }
  }, [open, account, currentUser, permissionList, reset]);    function onSubmit(data: FormData) {
    //Transform data.permission from Record<string, boolean> to an array of string that has true value
    const processedPerms = Object.keys(data.permission || {}).filter(
      (key) => data.permission[key]
    );
    
    // Transform data.skills from Record<string, boolean> to an array of string that has true value
    const processedSkills = Object.keys(data.skills || {}).filter(
      (key) => data.skills[key]
    );
    
    // Update account data
    accountUpdateMutation.mutate({
      id: id as string,
      updateData: {
        email: data.email,
        role: data.role,
        permission: processedPerms,
      },
    });
    
    // Update user skills if user exists
    if (currentUser) {
      adminUpdateUserMutation.mutate({
        userId: currentUser._id,
        updateData: {
          skills: processedSkills,
        },
      });
    }
    
    setOpen(false);
  }if (!account || !permissionList || !allUsersQuery.data) return <></>;
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
              </Grid>              <Grid item xs={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "invalid email address",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Email"
                      value={field.value || ""}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => {
                    if (account.role === "admin") {
                      return (
                        <Select
                          label="Role"
                          disabled
                          {...field}
                          value={field.value || account.role}
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
                        value={field.value || account.role}
                        fullWidth
                      >
                        <MenuItem value="project_manager">Project Manager</MenuItem>
                        <MenuItem value="security_expert">Security Expert</MenuItem>
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
              </Grid>              <Grid item xs={12}>
                <Divider />
              </Grid>
              {currentUser && (
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <SkillsSection control={control} userId={currentUser._id} />
                  </Stack>
                </Grid>
              )}
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
