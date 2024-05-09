import colors from "@/constants/colors";
import { createTheme } from "@mui/material/styles";
import paletteOptions from "./palette";

// Create a light theme instance
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: paletteOptions.greenPrimary,
    },
    secondary: {
      main: colors.secondary.green,
    },
    ...paletteOptions,
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    button: {
      textTransform: "none",
    },
    allVariants: {
      color: colors.primary.dark,
    },
  },
});

// Create a dark theme instance
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: paletteOptions.greenPrimary,
    },
    secondary: {
      main: colors.secondary.green,
    },
    ...paletteOptions,
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    button: {
      textTransform: "none",
    },
    allVariants: {
      color: colors.simple.text,
    },
  },
});

export { lightTheme, darkTheme };
