// App.js
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import root from "./routes/root";

const CLIENT_ID = "86450001711-...apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <RouterProvider router={root} />
    </GoogleOAuthProvider>
  );
}

export default App;