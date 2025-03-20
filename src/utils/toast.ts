import { OptionsObject, SnackbarKey, SnackbarMessage } from "notistack";
import {
  IErrorResponse,
  ISuccessResponse,
} from "~/hooks/fetching/response-type";

export function toast(
  response: ISuccessResponse<any> | IErrorResponse,
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey,
  invalidateFn: Function
) {
  if (response.status === "success") {
    enqueueSnackbar(response.message, { variant: "success" });
    invalidateFn();
  } else if (response.status === "error") {
    enqueueSnackbar(response.message, { variant: "error" });
  }
}
