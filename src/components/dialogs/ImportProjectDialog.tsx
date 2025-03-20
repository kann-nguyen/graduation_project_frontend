import { GitHub } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { RepoImport } from "~/hooks/fetching/git";
import { useGetRepo } from "~/hooks/fetching/git/query";
import { useImportProjectMutation } from "~/hooks/fetching/project/query";
import { GitLab } from "~/icons/Icons";
interface Data {
  data: RepoImport;
}
export default function ImportProject({ setClose }: { setClose: () => void }) {
  const importProjectMutation = useImportProjectMutation();
  const { control, handleSubmit } = useForm<Data>();
  const importProjectListQuery = useGetRepo();
  if (importProjectListQuery[0].isError || importProjectListQuery[1].isError)
    return <></>;
  const importProjectList = importProjectListQuery.flatMap(
    (item) => item.data?.data ?? []
  );
  async function onSubmit(data: Data) {
    importProjectMutation.mutate(data.data);
    setClose();
  }
  function groupSelection(url: string) {
    if (url.includes("github")) return "Github";
    if (url.includes("gitlab")) return "Gitlab";
    return "Other";
  }
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>Import project from Github/Gitlab</DialogTitle>
      <DialogContent>
        <Controller
          name="data"
          control={control}
          render={({ field: { onChange } }) => (
            <Autocomplete
              onChange={(event, newValue) => onChange(newValue)}
              options={importProjectList}
              getOptionLabel={(option) => option.url}
              renderOption={(props, option) => (
                <Box component="li" sx={{ "& > svg": { mr: 2 } }} {...props}>
                  {option.url.includes("github") ? <GitHub /> : <GitLab />}
                  {option.name}
                  <Chip label={option.status} sx={{ ml: 1 }} />
                </Box>
              )}
              groupBy={(option) => groupSelection(option.url)}
              renderInput={(params) => (
                <Box>
                  <TextField {...params} label="Choose a project" />
                </Box>
              )}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={setClose} color="inherit">
          Cancel
        </Button>
        <Button type="submit">Import</Button>
      </DialogActions>
    </Box>
  );
}
