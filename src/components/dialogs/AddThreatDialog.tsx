import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Control, Controller, useForm } from "react-hook-form";
import { useCreateThreatMutation } from "~/hooks/fetching/threat/query";
import { ThreatCreate } from "~/hooks/fetching/threat";
import { typeOptions } from "../../utils/threat-display";
interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
}
function ScoreSlider({
  registerString,
  text,
  control,
}: {
  registerString:
    | "score.details.damage"
    | "score.details.reproducibility"
    | "score.details.exploitability"
    | "score.details.affectedUsers"
    | "score.details.discoverability";
  text: string;
  control: Control<ThreatCreate, any>;
}) {
  return (
    <Stack spacing={1} justifyContent="center">
      <Typography variant="subtitle2">{text}</Typography>
      <Controller
        name={registerString}
        control={control}
        render={({ field }) => (
          <Slider
            {...field}
            defaultValue={0}
            step={1}
            min={0}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
        )}
      />
    </Stack>
  );
}
export default function AddThreatDialog({ open, setOpen }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
    watch,
    reset,
  } = useForm<ThreatCreate>({
    defaultValues: {
      name: "",
      description: "",
      type: "Spoofing",
      score: {
        total: 0,
        details: {
          damage: 0,
          reproducibility: 0,
          exploitability: 0,
          affectedUsers: 0,
          discoverability: 0,
        },
      },
    },
  });
  const watchFields = watch([
    "score.details.damage",
    "score.details.reproducibility",
    "score.details.exploitability",
    "score.details.affectedUsers",
    "score.details.discoverability",
  ]);
  useEffect(() => {
    reset();
  }, [open]);
  useEffect(() => {
    const sum = Object.values(watchFields).reduce((a, b) => a + b, 0);
    setValue("score.total", sum / 5);
  }, [watchFields]);
  const createThreatMutation = useCreateThreatMutation();
  async function submit(data: ThreatCreate) {
    createThreatMutation.mutate(data);
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Create a new threat</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(submit)}>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            autoFocus
            label="Name"
            variant="standard"
            {...register("name", {
              required: "Name is required",
            })}
            error={errors.name !== undefined}
            helperText={errors.name?.message}
          />
          <TextField
            fullWidth
            margin="normal"
            multiline
            rows={3}
            label="Description"
            variant="standard"
            {...register("description", {
              required: "Description is required",
            })}
            error={errors.description !== undefined}
            helperText={errors.description?.message}
          />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">Type</Typography>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  {typeOptions.map((opt) => (
                    <MenuItem key={opt.name} value={opt.name}>
                      <Tooltip title={opt.description}>
                        <ListItemText primary={opt.name} />
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Box>
          <ScoreSlider
            control={control}
            registerString="score.details.damage"
            text="Damage: How big would the damage be if the attack succeeded?"
          />
          <ScoreSlider
            control={control}
            registerString="score.details.reproducibility"
            text="Reproducibility: How easy is it to reproduce the attack?"
          />
          <ScoreSlider
            control={control}
            registerString="score.details.exploitability"
            text="Exploitability: How easy is it to exploit the vulnerability?"
          />
          <ScoreSlider
            control={control}
            registerString="score.details.affectedUsers"
            text="Affected Users: How many users are affected by the vulnerability?"
          />
          <ScoreSlider
            control={control}
            registerString="score.details.discoverability"
            text="Discoverability: How easy is it to discover the vulnerability?"
          />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">Final score</Typography>
            <TextField {...register("score.total")} disabled />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
