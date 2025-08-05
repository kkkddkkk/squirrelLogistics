import React from "react";
import Button from "@mui/material/Button"
import { Route, RouterProvider, Routes } from "react-router-dom";
import paymentRouter from "./routes/paymentRoutes/paymentRouter";
import ScrollToTop from "./components/ScrollToTop"
import Layout from "./pages/Layout/Layout"
import RegisterPage from "./pages/Layout/RegisterPage";
function App() {
  return (
    <>
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
};

export default App;
