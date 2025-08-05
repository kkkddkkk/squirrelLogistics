<<<<<<< HEAD
// App.js
import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import RegisterPage from "./pages/Layout/RegisterPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
=======
<<<<<<< Updated upstream
import React from "react";
import Button from "@mui/material/Button"
import { Route, RouterProvider, Routes } from "react-router-dom";
import paymentRouter from "./routes/paymentRoutes/paymentRouter";
import ScrollToTop from "./components/ScrollToTop"
import Layout from "./pages/Layout/Layout"
import RegisterPage from "./pages/Layout/RegisterPage";
=======
// App.js
import { Routes, Route, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import RegisterPage from "./pages/Layout/RegisterPage";
import ScrollToTop from "./components/ScrollToTop";
import root from "./routes/root";

>>>>>>> Stashed changes
function App() {
  return (
    <RouterProvider router={root}></RouterProvider>
>>>>>>> feature/paymentPage/GPT-21
  );
};

export default App;