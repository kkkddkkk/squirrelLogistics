import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import SupportLayout from "../pages/Support/SupportLayout";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/" element={<AdminLayout />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="support/*" element={<SupportLayout />} />
    </Route>
  </Routes>
);

// ✅ 꼭 필요합니다!
export default AppRoutes;
