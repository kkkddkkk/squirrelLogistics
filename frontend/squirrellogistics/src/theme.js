import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#113F67", // 메인 파란색
      light: "#58A0C8",
      dark: "#34699A",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#E8A93F", // 노란색
      light: "#F4D03F",
      dark: "#D68910",
      contrastText: "#2A2A2A",
    },
    background: {
      default: "#F5F7FA", // 메인 배경색
      paper: "#ffffff",
    },
    text: {
      primary: "#2A2A2A", // 메인 폰트 색상
      secondary: "#909095",
    },
    grey: {
      50: "#F5F7FA",
      100: "#E0E6ED",
      200: "#C5C7CD",
      300: "#909095",
      400: "#6C757D",
      500: "#495057",
      600: "#343A40",
      700: "#2A2A2A",
    },
    success: {
      main: "#31A04F",
    },
    warning: {
      main: "#E8A93F",
    },
    error: {
      main: "#A20025",
    },
  },
  typography: {
    fontFamily:
      '"Spoqa Han Sans Neo", "Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: "#113F67",
    },
    h2: {
      fontWeight: 600,
      color: "#113F67",
    },
    h3: {
      fontWeight: 600,
      color: "#113F67",
    },
    h4: {
      fontWeight: 600,
      color: "#113F67",
    },
    h5: {
      fontWeight: 500,
      color: "#2A2A2A",
    },
    h6: {
      fontWeight: 500,
      color: "#2A2A2A",
    },
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
        contained: {
          boxShadow: "0 2px 4px rgba(17, 63, 103, 0.2)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(17, 63, 103, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
