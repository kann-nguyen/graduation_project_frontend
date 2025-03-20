import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  FormLabel,
  Stack,
  TextField,
} from "@mui/material";
import { langs } from "@uiw/codemirror-extensions-langs";
import ReactCodeMirror from "@uiw/react-codemirror";
import { Controller, useForm } from "react-hook-form";
import {
  useGetScanner,
  useUpdateScannerMutation,
} from "~/hooks/fetching/scanner/query";
import Instruction from "../text/Instruction";
import { useSearchParams } from "react-router-dom";

export default function EditScannerDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [searchParams] = useSearchParams();
  const scannerId = searchParams.get("scannerId") ?? "";
  async function onSubmit(data: CreateOrUpdateNewScanner) {
    updateScannerMutation.mutate(data);
    setOpen(false);
  }
  const { register, control, handleSubmit } =
    useForm<CreateOrUpdateNewScanner>();
  const updateScannerMutation = useUpdateScannerMutation();
  const scannerQuery = useGetScanner(scannerId);
  const scanner = scannerQuery.data?.data;
  if (!scanner) return <></>;
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg">
      <DialogTitle>Scanner</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <TextField
            defaultValue={scanner.name}
            fullWidth
            label="Name"
            {...register("name", {
              required: "Name is required",
            })}
          />
          <TextField
            defaultValue={scanner.config?.installCommand}
            fullWidth
            label="Install command"
            {...register("config.installCommand", {
              required: "Install command is required",
            })}
          />
          <Instruction />
          <FormControl>
            <FormLabel>Code (JavaScript)</FormLabel>
            <Controller
              name="config.code"
              control={control}
              defaultValue={scanner.config?.code}
              render={({ field }) => (
                <ReactCodeMirror
                  {...field}
                  extensions={[langs.javascript()]}
                  width="100%"
                  height="500px"
                />
              )}
            />
          </FormControl>
        </Stack>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Close
          </Button>
          <Button type="submit">Update</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
