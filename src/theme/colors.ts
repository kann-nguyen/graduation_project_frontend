import { alpha } from "@mui/material/styles";

const withAlphas = (color: any) => {
  return {
    ...color,
    alpha4: alpha(color.main, 0.04),
    alpha8: alpha(color.main, 0.08),
    alpha12: alpha(color.main, 0.12),
    alpha30: alpha(color.main, 0.3),
    alpha50: alpha(color.main, 0.5),
  };
};

export const neutral = {
  50: "#F9FAFB",
  100: "#F2F4F7",
  200: "#E4E7EC",
  300: "#D0D5DD",
  400: "#98A2B3",
  500: "#667085",
  600: "#475467",
  700: "#344054",
  800: "#1D2939",
  900: "#101828",
};

export const indigo = withAlphas({
  lightest: "#F5F7FF",
  light: "#EBEEFE",
  main: "#6366F1",
  dark: "#4338CA",
  darkest: "#312E81",
  contrastText: "#FFFFFF"
});

export const primary = withAlphas({
  lightest: "#F5F7FF",
  light: "#EBEEFE",
  main: "#4F46E5",
  dark: "#3730A3",
  darkest: "#312E81",
  contrastText: "#FFFFFF"
});

export const success = withAlphas({
  lightest: "#ECFDF3",
  light: "#D1FADF", 
  main: "#12B76A",
  dark: "#027A48",
  darkest: "#054F31",
  contrastText: "#FFFFFF"
});

export const info = withAlphas({
  lightest: "#F5FAFF",
  light: "#D1E9FF",
  main: "#2E90FA",
  dark: "#1849A9",
  darkest: "#194185",
  contrastText: "#FFFFFF"
});

export const warning = withAlphas({
  lightest: "#FFFAEB",
  light: "#FEF0C7",
  main: "#F79009",
  dark: "#B54708",
  darkest: "#7A2E0E",
  contrastText: "#FFFFFF"
});

export const error = withAlphas({
  lightest: "#FEF3F2",
  light: "#FEE4E2",
  main: "#F04438",
  dark: "#B42318",
  darkest: "#7A271A",
  contrastText: "#FFFFFF"
});
