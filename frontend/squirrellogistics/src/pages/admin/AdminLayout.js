// src/admin/AdminLayout.jsx
import { Outlet } from "react-router-dom"
import { Suspense } from "react";
import Header from "../Layout/Header";
import {
    AppBar,
    Box,
    Button,
    Container,
    CssBaseline,
    Toolbar,
    useTheme,
} from "@mui/material";

export default function AdminLayout() {

    return (
        <>
            <Header />
            <Outlet />
        </>
    );
}
