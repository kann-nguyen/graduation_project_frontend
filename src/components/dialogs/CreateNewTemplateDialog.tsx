import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { PhaseTemplate, PhaseTemplateCreate } from "~/hooks/fetching/phase";
import { useCreatePhaseTemplateMutation } from "~/hooks/fetching/phase/query";
import { useUserRole } from "~/hooks/general";

export default function CreateNewTemplateDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const role = useUserRole();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<PhaseTemplateCreate>({
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
      phases: [
        {
          name: "",
          description: "",
          order: 0,
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "phases",
  });
  const createTemplateMutation = useCreatePhaseTemplateMutation();
  async function onSubmit(data: PhaseTemplateCreate) {
    createTemplateMutation.mutate(data);
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Create new template</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Controller
                  name="isPrivate"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <Checkbox {...field} disabled={role === "admin"} />
                  )}
                />
              }
              label="Make this template private"
            />
            <TextField
              label="Template's name"
              variant="outlined"
              fullWidth
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Template's description"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              {...register("description", {
                required: "Description is required",
              })}
              error={!!errors.name}
              helperText={errors.description?.message}
            />
            <Box sx={{ display: "flex" }}>
              {fields.map((field, index) => (
                <Card sx={{ m: 1 }} key={field.id}>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Phase {index + 1}
                    </Typography>
                    <TextField
                      label="Name"
                      fullWidth
                      {...register(`phases.${index}.name` as const, {
                        required: "Name is required",
                      })}
                      error={!!errors.phases?.[index]?.name}
                      helperText={errors.phases?.[index]?.name?.message}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      {...register(`phases.${index}.description` as const, {
                        required: "Description is required",
                      })}
                      error={!!errors.phases?.[index]?.description}
                      helperText={errors.phases?.[index]?.description?.message}
                    />
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => remove(index)}>
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
            <Button
              variant="contained"
              sx={{ m: 1, p: 1 }}
              onClick={() =>
                append({ name: "", description: "", order: fields.length })
              }
              fullWidth
            >
              Add phase
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button type="submit" color="success">
            Create
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
