import React from "react";
import Button from "@mui/material/Button"
import { RouterProvider } from "react-router-dom";
import paymentRouter from "./routes/paymentRoutes/paymentRouter";
function App() {
  return (
    // <div>
    //   <header>
    //     <p>
    //       main
    //     </p>

    //       Learn React
    //       <Button variant="contained"> 버튼 테스트</Button>
    //   </header>
    // </div>
    <RouterProvider router={paymentRouter}>
    </RouterProvider>
  );
}

export default App;
