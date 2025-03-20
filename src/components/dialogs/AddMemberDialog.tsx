import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAddMemberToProjectMutation } from "~/hooks/fetching/project/query";
import { User } from "~/hooks/fetching/user";
import { useGetAllUsersQuery } from "~/hooks/fetching/user/query";
interface FormData {
  user: User;
}
export default function AddMemberDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { currentProject } = useParams();
  const addMemberToProjectMutation = useAddMemberToProjectMutation();
  const { control, handleSubmit } = useForm<FormData>();
  const usersQuery = useGetAllUsersQuery();
  const users = usersQuery.data?.data ?? [];
  function onSubmit(data: FormData) {
    addMemberToProjectMutation.mutate({
      projectName: currentProject,
      accountId: data.user.account._id,
    });
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Add a member</DialogTitle>
        <Stack spacing={2} p={2}>
          <Controller
            name="user"
            control={control}
            render={({ field: { onChange } }) => (
              <Autocomplete
                options={users}
                onChange={(event, data) => onChange(data)}
                getOptionLabel={(user) => user.account.username}
                renderInput={(params) => <TextField {...params} label="User" />}
              />
            )}
          />
        </Stack>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit">Add</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
