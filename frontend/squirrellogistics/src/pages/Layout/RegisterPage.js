import { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import DriverForm from "./DriverForm";
import CompanyForm from "./CompanyForm";
// import styles from "../../css/RegistForm.module.css";
import "../../css/RegistForm.module.css";
import Header from "./Header";
import Footer from "./Footer";
import { theme, applyThemeToCssVars, darkTheme } from "../../components/common/CommonTheme";
import { CommonTitle } from "../../components/common/CommonText";
import { useDarkMode } from "../../DarkModeContext";
import { ButtonContainer, TwoToggleButton } from "../../components/common/CommonButton";

export default function RegisterPage() {
    const [type, setType] = useState("driver");
    const thisTheme = useTheme();

    useEffect(() => {
        const root = document.documentElement;

        root.style.setProperty("--primary-main", thisTheme.palette.primary.main);
        root.style.setProperty("--primary-dark", thisTheme.palette.primary.dark);
        root.style.setProperty("--secondary-main", thisTheme.palette.secondary.main);
        root.style.setProperty("--background-default", thisTheme.palette.background.default);
        root.style.setProperty("--background-paper", thisTheme.palette.background.paper);
        root.style.setProperty("--text-primary", thisTheme.palette.text.primary);
        root.style.setProperty("--text-secondary", thisTheme.palette.text.secondary);

    }, [thisTheme.palette.primary.main])


    return (
        <>
            <Header />
            <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
                <CommonTitle>회원가입</CommonTitle>

                {/* 탭 버튼 */}
                {/* <Box className={'tabContainer'}>
                    <button
                        className={`$tabButton ${type === "driver" ? "activeTab" : ""}`}
                        onClick={() => setType("driver")}
                    >
                        배송기사
                    </button>
                    <button
                        className={`tabButton ${type === "company" ? "activeTab" : ""}`}
                        onClick={() => setType("company")}
                    >
                        물류회사
                    </button>
                </Box> */}
                <ButtonContainer marginBottom={5}>
                    <TwoToggleButton
                        leftTitle={"배송기사"}
                        leftClickEvent={() => setType("driver")}
                        rightTitle={"물류회사"}
                        rightClickEvent={() => setType("company")}
                        height={50}
                    />
                </ButtonContainer>


                {/* 폼 */}
                <Box className='formContainer'>
                    {type === "driver" ? <DriverForm /> : <CompanyForm />}
                </Box>
            </Box>
            <Footer />
        </>
    );
}
