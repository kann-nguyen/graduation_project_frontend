import { ArrowBack, Build, Delete, Save } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Slide,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { ReactElement, Ref, forwardRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { Threat } from "~/hooks/fetching/threat";
import {
  useThreatQuery,
  useUpdateThreatMutation,
} from "~/hooks/fetching/threat/query";
import { typeOptions } from "~/utils/threat-display";
function ScoreTable({ total, details }: Threat["score"]) {
  const {
    damage,
    reproducibility,
    exploitability,
    affectedUsers,
    discoverability,
  } = details;
  return (
    <Table component={Paper}>
      <TableHead>
        <TableRow>
          <TableCell>Damage</TableCell>
          <TableCell>Reproducibility</TableCell>
          <TableCell>Exploitability</TableCell>
          <TableCell>Affected Users</TableCell>
          <TableCell>Discoverability</TableCell>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableHead>
      <TableRow>
        <TableCell>{damage}</TableCell>
        <TableCell>{reproducibility}</TableCell>
        <TableCell>{exploitability}</TableCell>
        <TableCell>{affectedUsers}</TableCell>
        <TableCell>{discoverability}</TableCell>
        <TableCell>{total}</TableCell>
      </TableRow>
    </Table>
  );
}
interface FormData {
  mitigation: {
    value: string;
  }[];
  status: "Non mitigated" | "Partially mitigated" | "Fully mitigated";
}
function Body({ data }: { data: Threat | null | undefined }) {
  const { control, register, getValues } = useForm<FormData>({
    defaultValues: {
      mitigation: data?.mitigation?.map((str) => ({
        value: str,
      })) ?? [
        {
          value: "",
        },
      ],
      status: data?.status ?? "Non mitigated",
    },
  });
  const updateThreatMutation = useUpdateThreatMutation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "mitigation",
  });
  const [editMode, setEditMode] = useState(false);
  if (!data) return <></>;
  function toggleEditMode() {
    setEditMode((prev) => !prev);
  }
  function saveChanges() {
    if (!data) return;
    const formData = getValues();
    const mitigation = formData.mitigation.map((item) => item.value);
    updateThreatMutation.mutate({
      id: data._id,
      data: {
        mitigation,
        status: formData.status,
      },
    });
    setEditMode((prev) => !prev);
  }
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="h4">
            <b>{data.name}</b>
          </Typography>
          {editMode ? (
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={saveChanges}
              color="success"
            >
              Save
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<Build />}
              onClick={toggleEditMode}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider />
        <Typography variant="h6">Description</Typography>
        <Typography>{data.description}</Typography>
        <Divider />
        <Typography variant="h6">Type of threat</Typography>
        <Typography>{`${data.type}: ${
          typeOptions.find((item) => item.name === data.type)?.description
        }`}</Typography>
        <Divider />
        <Typography variant="h6">Score</Typography>
        <ScoreTable details={data.score.details} total={data.score.total} />
        <Divider />
        <Typography variant="h6">Current status</Typography>
        {editMode ? (
          <Controller
            name="status"
            control={control}
            defaultValue={data.status}
            render={({ field }) => (
              <Select {...field} variant="outlined">
                <MenuItem value="Non mitigated">🔴 Non mitigated</MenuItem>
                <MenuItem value="Partially mitigated">
                  🟠 Partially mitigated
                </MenuItem>
                <MenuItem value="Fully mitigated">🟢 Fully mitigated</MenuItem>
              </Select>
            )}
          />
        ) : (
          <Typography>{data.status}</Typography>
        )}
        <Divider />
        <Typography variant="h6">Mitigation</Typography>
        {editMode ? (
          <>
            {fields.map((field, index) => (
              <TextField
                key={field.id}
                {...register(`mitigation.${index}.value`)}
                label="Mitigation"
                fullWidth
                multiline
                rows={3}
                placeholder="Type your mitigation here"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => remove(index)}>
                        <Delete />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ))}
            <Button onClick={() => append({ value: "" })}>
              Add another mitigation
            </Button>
          </>
        ) : (
          <>
            {data?.mitigation.map((str) => (
              <Typography>{str}</Typography>
            ))}
          </>
        )}
      </Stack>
    </Container>
  );
}
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});
export default function ThreatDetailsDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("threatId") as string;
  const getThreatQuery = useThreatQuery(id);
  const threat = getThreatQuery.data?.data;
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullScreen
      TransitionComponent={Transition}
    >
      <AppBar position="relative">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(false)}
            aria-label="close"
          >
            <ArrowBack />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Body data={threat} />
    </Dialog>
  );
}
