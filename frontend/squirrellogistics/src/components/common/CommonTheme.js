import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#113F67",  // MAIN THEME
      dark: "#344F59", //DARK THEME
      light: "#34699A", //LIGHT THEME
    },
    secondary: {
      main: "#58A0C8", //LIGHTER THEME
    },
    success: {
      main: "#31A04F" //GREEN
    },
    warning: {
      main: "#E8A93F" //YELLOW
    },
    error: {
      main: "#A20025" //RED
    },
    background: {
      default: "#FDFDFD",
      paper: "#ffffff",
    },
    text: {
      primary: "#2A2A2A",
      secondary: "#909095",
    },

  },
});

//CSS에 주입
export const applyThemeToCssVars = (theme) => {
  const root = document.documentElement;

  root.style.setProperty("--primary-main", theme.palette.primary.main);
  root.style.setProperty("--secondary-main", theme.palette.secondary.main);
  root.style.setProperty("--info-main", theme.palette.info.main);
  root.style.setProperty("--success-main", theme.palette.success.main);
  root.style.setProperty("--warning-main", theme.palette.warning.main);
  root.style.setProperty("--error-main", theme.palette.error.main);

  root.style.setProperty("--background-default", theme.palette.background.default);
  root.style.setProperty("--background-paper", theme.palette.background.paper);

  root.style.setProperty("--text-primary", theme.palette.text.primary);
  root.style.setProperty("--text-secondary", theme.palette.text.secondary);
};