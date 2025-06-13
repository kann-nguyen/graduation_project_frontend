import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { ArtifactUpdate } from "~/hooks/fetching/artifact";
import {
  useArtifactQuery,
  useUpdateArtifactMutation,
} from "~/hooks/fetching/artifact/query";
import { useThreatsQuery } from "~/hooks/fetching/threat/query";
const type = ["image", "log", "source code", "executable", "library"];
interface UpdateArtifactFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export default function UpdateArtifactDialog({
  open,
  setOpen,
}: UpdateArtifactFormProps) {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ArtifactUpdate>();
  const watchCpe = watch("cpe");

  useEffect(() => {
    if (watchCpe) {
      setValue("name", getValues("cpe")?.split(":")[4] ?? "");
      setValue("version", getValues("cpe")?.split(":")[5] ?? "");
    }
  }, [setValue, watchCpe]);
  const threatsQuery = useThreatsQuery();
  const threats = threatsQuery.data?.data ?? [];
  const updateArtifactMutation = useUpdateArtifactMutation();
  const [searchParams] = useSearchParams();
  const artifactId = searchParams.get("artifactId") ?? "";
  const artifactQuery = useArtifactQuery(artifactId);
  const artifact = artifactQuery.data?.data;  useEffect(() => {
    if (artifact) {
      reset({
        name: artifact.name,
        url: artifact.url,
        version: artifact.version,
        cpe: artifact.cpe
      });
    }
  }, [artifactId, artifact, reset]);
  if (!artifact) return <></>;
  async function submit(data: ArtifactUpdate) {
    if (!artifact) return; // Early return if artifact is not available
    
    updateArtifactMutation.mutate({
      artifactId,
      artifact: {
        ...data,
        type: artifact.type, // Include the artifact type from the current artifact
      },
    });
    setOpen(false);
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <Box component="form" onSubmit={handleSubmit(submit)}>
        <DialogTitle>Update this artifact</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                  InputLabelProps={{ shrink: field.value ? true : false }}
                />
              )}
            />            <Controller
              name="url"
              control={control}
              rules={{
                required: "Url is required",
                pattern: {
                  value: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                  message: "Invalid URL"
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="URL"
                  error={!!errors.url}
                  helperText={
                    errors.url?.type === "pattern"
                      ? "Invalid URL"
                      : errors.url?.message
                  }
                  required
                  InputLabelProps={{ shrink: field.value ? true : false }}
                />
              )}
            />            <Controller
              name="version"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Version"
                  InputLabelProps={{ shrink: field.value ? true : false }}
                />
              )}
            />
            <TextField
              {...register("cpe", {
                pattern:
                  /cpe:2\.3:[aho\*\-](:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])){5}(:(([a-zA-Z]{2,3}(-([a-zA-Z]{2}|[0-9]{3}))?)|[\*\-]))(:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])){4}/,
              })}
              defaultValue={artifact.cpe}
              label="CPE string"
              helperText={
                errors.cpe
                  ? "Invalid CPE string"
                  : "Hint: You can autofill name and version of the artifact by filling in the CPE string. Example of CPE string: cpe:2.3:a:apache:tomcat:3.0:*:*:*:*:*:*:* "
              }
              error={!!errors.cpe}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Type</Typography>
              <RadioGroup row defaultValue={artifact.type}>
                {type.map((item) => (
                  <FormControlLabel
                    disabled
                    key={item}
                    value={item}
                    control={<Radio />}
                    label={item}
                  />
                ))}
              </RadioGroup>
            </Box>            
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button type="submit">Update</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
