import { createTheme, lighten } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#113F67",  // MAIN THEME
      dark: "rgba(255,255,255,.08)", //DARK THEME
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // 기본 버튼 스타일
          textTransform: "none",
          // 호버 색상 강제 지정
          "&:hover": {
            backgroundColor: lighten("#113F67", 0.1), // 호버 시 원하는 색
            color: "#FDFDFD"
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#58A0C8",  // MAIN THEME
      dark: "rgba(255,255,255,.08)", //DARK THEME
      light: "#34699A", //LIGHT THEME
    },
    secondary: {
      main: "#4FC3F7", //LIGHTER THEME
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
      default: "#2A2A2A",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#FDFDFD",
      secondary: "#909095",
    },

  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // 기본 버튼 스타일
          textTransform: "none",
          // 호버 색상 강제 지정
          "&:hover": {
            backgroundColor: lighten("#58A0C8", 0.1), // 호버 시 원하는 색
            color: "#FDFDFD"
          },
        },
      },
    },
     MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": {
            borderColor: "#909095", // 기본 테두리 색
          },
          "&:hover fieldset": {
            borderColor: "#4FC3F7", // 호버 시 테두리 색
          },
          "&.Mui-focused fieldset": {
            borderColor: "#58A0C8", // 포커스 시 테두리 색
          },
        },
      },
    },
  },
});

//CSS에 주입
export const applyThemeToCssVars = (theme) => {
  const root = document.documentElement;
  
  const { primary, secondary, success, warning, error, info, background, text } = theme.palette;

  root.style.setProperty("--primary-main", primary.main);
  root.style.setProperty("--primary-dark", primary.dark);
  root.style.setProperty("--secondary-main", secondary.main);
  root.style.setProperty("--info-main", info?.main || "#00BFFF");
  root.style.setProperty("--success-main", success.main);
  root.style.setProperty("--warning-main", warning.main);
  root.style.setProperty("--error-main", error.main);

  root.style.setProperty("--background-default", background.default);
  root.style.setProperty("--background-paper", background.paper);

  root.style.setProperty("--text-primary", text.primary);
  root.style.setProperty("--text-secondary", text.secondary);
};

