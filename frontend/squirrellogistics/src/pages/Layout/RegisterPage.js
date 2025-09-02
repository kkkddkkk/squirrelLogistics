import { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import DriverForm from "./DriverForm";
import CompanyForm from "./CompanyForm";
import styles from "../../css/RegistForm.module.css";
import Header from "./Header";
import Footer from "./Footer";
import { theme, applyThemeToCssVars, darkTheme } from "../../components/common/CommonTheme";
import { CommonTitle } from "../../components/common/CommonText";
import { useDarkMode } from "../../DarkModeContext";

export default function RegisterPage() {
    const [type, setType] = useState("driver");
    const { darkMode } = useDarkMode();
    useEffect(() => {
        applyThemeToCssVars(darkMode ? darkTheme : theme);
        console.log(darkMode, darkTheme, theme);
    }, [darkMode]);


    return (
        <>
            <Header />
            <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
                <CommonTitle>회원가입</CommonTitle>

                {/* 탭 버튼 */}
                <Box className={styles.tabContainer}>
                    <button
                        className={`${styles.tabButton} ${type === "driver" ? styles.activeTab : ""}`}
                        onClick={() => setType("driver")}
                    >
                        배송기사
                    </button>
                    <button
                        className={`${styles.tabButton} ${type === "company" ? styles.activeTab : ""}`}
                        onClick={() => setType("company")}
                    >
                        물류회사
                    </button>
                </Box>

                {/* 폼 */}
                <Box className={styles.formContainer}>
                    {type === "driver" ? <DriverForm /> : <CompanyForm />}
                </Box>
            </Box>
            <Footer />
        </>
    );
}
