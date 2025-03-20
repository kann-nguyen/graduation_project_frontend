import { Add, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { PhaseTemplateUpdate } from "~/hooks/fetching/phase";
import {
  useGetPhaseTemplateByIdQuery,
  useUpdateTemplateMutation,
} from "~/hooks/fetching/phase/query";

export default function PhaseTemplateDetailsDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId") ?? "";
  const phaseTemplateQuery = useGetPhaseTemplateByIdQuery(templateId);
  const updateTemplateMutation = useUpdateTemplateMutation();
  const template = phaseTemplateQuery.data?.data;
  const { register, handleSubmit, control, setValue } =
    useForm<PhaseTemplateUpdate>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "phases",
  });
  useEffect(() => {
    if (template) {
      setValue("name", template.name);
      setValue("description", template.description);
      setValue("phases", template.phases);
    }
  }, [template, setValue]);
  function onSubmit(data: PhaseTemplateUpdate) {
    updateTemplateMutation.mutate({
      id: templateId,
      data,
    });
    setOpen(false);
  }
  if (!template) return <></>;
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
      <DialogTitle>Template details</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4} alignItems="center" sx={{ m: 2 }}>
          <TextField
            label="Template's name"
            variant="outlined"
            fullWidth
            disabled={template.isPrivate}
            {...register("name", {
              required: true,
            })}
          />
          <TextField
            label="Template's description"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            disabled={template.isPrivate}
            {...register("description", {
              required: true,
            })}
          />
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {fields.map((field, index) => (
              <Card sx={{ m: 1 }} key={index}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Phase {index + 1}
                  </Typography>
                  <TextField
                    label="Name"
                    fullWidth
                    sx={{ mb: 1 }}
                    disabled={template.isPrivate}
                    {...register(`phases.${index}.name` as const, {
                      required: true,
                    })}
                  />
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    disabled={template.isPrivate}
                    {...register(`phases.${index}.description` as const, {
                      required: true,
                    })}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<Delete />}
                    onClick={() => remove(index)}
                    color="error"
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              startIcon={<Add />}
              onClick={() =>
                append({
                  name: "",
                  description: "",
                  order: fields.length,
                })
              }
            >
              Append a new phase
            </Button>
          </Box>
        </Stack>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button type="submit" color="success" disabled={template.isPrivate}>
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
