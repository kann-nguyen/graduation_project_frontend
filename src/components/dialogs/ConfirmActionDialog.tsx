import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  text: string;
  callback: Function;
}
export default function ConfirmActionDialog({
  text,
  open,
  setOpen,
  callback,
}: Props) {
  function handleClose() {
    setOpen(false);
  }
  function confirmDelete() {
    setOpen(false);
    callback();
  }
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          No
        </Button>
        <Button onClick={confirmDelete}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}
