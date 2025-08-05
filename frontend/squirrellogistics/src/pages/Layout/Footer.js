import { useNavigate } from "react-router-dom";
import styles from "../../css/Footer.module.css";
import { Box, Typography, Button } from "@mui/material";

export default function Footer() {

    const navigate = useNavigate();
    return (
        <>
            {/* 상단 파란 영역 */}
            <Box className={styles.footerWrap}>
                <Typography className={styles.footerTitle}>
                    다람로지틱스와 함께하세요
                </Typography>
                <Typography className={styles.footerSubText}>
                    회원가입 한 번으로 다양한 서비스를 이용하세요.
                </Typography>
                <Button onClick={() => navigate("/register")}>
                    무료 회원 가입하기
                </Button>

            </Box>

            {/* 하단 회색 바 영역 */}
            <Box className={styles.grayBottomBar}>
                <div>Squirrel Logistics Squirrel Logistics Squirrel Logistics</div>
                <div>Squirrel Logistics Squirrel Logistics Squirrel Logistics</div>
                <div>Squirrel Logistics Squirrel Logistics Squirrel Logistics</div>
                <div>Squirrel Logistics Squirrel Logistics Squirrel Logistics</div>
            </Box>
        </>
    );
}
