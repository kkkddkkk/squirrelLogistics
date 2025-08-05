import styles from "../../css/Header.module.css";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useState } from "react";
import LoginModal from "./LoginModal";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const [loginOpen, setLoginOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <AppBar position="static" color="default">
                <Toolbar className={styles.headerContainer}>
                    <Typography
                        variant="h6"
                        onClick={() => navigate("/")}
                        sx={{ cursor: "pointer" }}
                    >
                        Squirrel Logistics
                    </Typography>
                    <div className={styles.navButtons}>
                        <Button color="inherit">서비스</Button>
                        <Button color="inherit">공지사항</Button>
                        <Button color="inherit">회사소개</Button>
                        <Button color="inherit" onClick={() => setLoginOpen(true)}>로그인</Button>
                        <Button onClick={() => navigate("/register")}>회원가입</Button>
                    </div>
                </Toolbar>
            </AppBar>

            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
