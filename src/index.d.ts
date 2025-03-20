import { PaletteOptions as MuiPaletteOptions } from "@mui/material/styles/createPalette";
declare module "@mui/material/styles" {
  interface PaletteOptions extends MuiPaletteOptions {
    neutral: PaletteOptions["primary"];
  }
}
declare module "react-router-dom" {
  export declare function useParams<
    ParamsOrKey extends string | Record<string, string | undefined> = string
  >(): { [key in ParamsOrKey]: string };
}
