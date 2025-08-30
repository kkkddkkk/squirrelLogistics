// App.js
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import root from "./routes/root";
import useAuthSession from "./api/user/useAuthSession";
import { ThemeProvider } from "@mui/material";
import { theme } from "./components/common/CommonTheme";

//const CLIENT_ID = "86450001711-...apps.googleusercontent.com";
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
function App() {
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
  return (
    <ThemeProvider theme={theme}>
      <GoogleOAuthProvider clientId={clientId}>
        <RouterProvider router={root} />
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;