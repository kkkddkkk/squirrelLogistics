import { useState } from "react";
import { Box, Typography } from "@mui/material";
import DriverForm from "./DriverForm";
import CompanyForm from "./CompanyForm";
import styles from "../../css/RegistForm.module.css";
import Header from "./Header";
import Footer from "./Footer";

export default function RegisterPage() {
    const [type, setType] = useState("driver");

    return (
        <>
            <Header />
            <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    회원가입
                </Typography>

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
            <Footer/>
        </>
    );
}
