// App.js
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import root from "./routes/root";
import useAuthSession from "./api/user/useAuthSession";
import { DarkModeProvider } from "./DarkModeContext";
import { Box, useTheme } from "@mui/material";

//const CLIENT_ID = "86450001711-...apps.googleusercontent.com";
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
function AppLayout() {
  useAuthSession({
    idleMinutes: 15, // 무활동 15분
    onLogout: (msg) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      if (msg) alert(msg);
      window.location.href = "/";
    },
  });

  const thisTheme = useTheme();

  return (
    <Box sx={{
      backgroundColor: thisTheme.palette.background.default
    }}>
      <GoogleOAuthProvider clientId={clientId}>
        <RouterProvider router={root} />
      </GoogleOAuthProvider>
    </Box>

  );
}

function App() {

  return (
    <DarkModeProvider >
      <AppLayout/>
    </DarkModeProvider>

  );
}

export default App;