import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAddResolutionMutation } from "~/hooks/fetching/vuln/query";
interface FormData {
  resolution: string;
}
export default function AddVulnResolutionDialog({
  open,
  setOpen,
  cveId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  cveId: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const addResolutionMutation = useAddResolutionMutation();
  async function onSubmit(data: FormData) {
    addResolutionMutation.mutate({
      cveId,
      description: data.resolution,
    });
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Resolution</DialogTitle>
        <Box p={2}>
          <TextField
            label="Resolution"
            multiline
            rows={5}
            fullWidth
            {...register("resolution", {
              required: "Resolution is required",
            })}
            error={!!errors.resolution}
            helperText={errors.resolution?.message}
          />
        </Box>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
