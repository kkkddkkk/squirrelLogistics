import styles from "../../css/InfiniteArea.module.css";
import { Box, Typography } from "@mui/material";

export default function InfiniteArea() {

    return (
        <Box className={styles.infiniteWrap}>
            {/* 1. 홍보 블럭 반복 */}
            <Box className={styles.section}>
                {[...Array(3)].map((_, i) => (
                    <Box key={i} className={styles.promoItem}>
                        <div className={styles.promoBox}></div>
                        <div className={styles.promoText}>
                            <Typography variant="h6">
                                즉시 견적부터 예약과 정산까지 하나의 플랫폼에서 가능합니다.
                            </Typography>
                            <Typography variant="body2">
                                필요한 기능을 모아둔 대시보드와 운영자와 실시간 커뮤니케이션으로 복잡하고 어려운 물류를 빠르고 편리하게 다람로지틱스에서 만나보세요.
                            </Typography>
                        </div>
                    </Box>
                ))}
            </Box>

            {/* 2. 차별화된 서비스 */}
            <Box className={styles.section}>
                <Typography variant="h6" gutterBottom>
                    다람로지틱스는 차별화된 물류 서비스를 제공합니다.
                </Typography>
                <Box className={styles.serviceGrid}>
                    {[...Array(3)].map((_, i) => (
                        <Box key={i} className={styles.serviceBox}></Box>
                    ))}
                </Box>
            </Box>

            {/* 3. 공지사항 */}
            <Box className={styles.section}>
                <Typography variant="h6" gutterBottom>공지사항</Typography>
                <Box className={styles.noticeGrid}>
                    {[...Array(3)].map((_, i) => (
                        <Box key={i} className={styles.noticeBox}></Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
