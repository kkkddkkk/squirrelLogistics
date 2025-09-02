import {
    Box,
    Container,
    Grid,
    Stack,
    Typography,
    Link,
    IconButton,
    Divider,
} from "@mui/material";
import { Facebook, Instagram, LinkedIn } from "@mui/icons-material";
import styles from "../../css/Footer.module.css";
import { theme, applyThemeToCssVars } from "../../components/common/CommonTheme";

export default function Footer() {
    applyThemeToCssVars(theme);
    return (
        <Box component="footer" sx={{ bgcolor: "#0B1220", color: "rgba(255,255,255,.88)" }}>
            {/* 본문 */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Grid container columnSpacing={6} rowSpacing={6} alignItems="flex-start">
                    {/* 브랜드 */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" className={styles.brand}>
                            Squirrel Logistics
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.85 }}>
                            스마트 물류 중개 플랫폼—빠르고 정확한 배송 경험을 제공합니다.
                        </Typography>

                        <Stack direction="row" spacing={1.2} sx={{ mt: 2.5 }}>
                            <IconButton className={styles.snsBtn} href="https://facebook.com" target="_blank" aria-label="Facebook">
                                <Facebook fontSize="small" />
                            </IconButton>
                            <IconButton className={styles.snsBtn} href="https://instagram.com" target="_blank" aria-label="Instagram">
                                <Instagram fontSize="small" />
                            </IconButton>
                            <IconButton className={styles.snsBtn} href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
                                <LinkedIn fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Grid>

                    {/* 바로가기 */}
                    <Grid item xs={6} md={4}>
                        <Typography variant="overline" className={styles.heading}>
                            바로가기
                        </Typography>
                        <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                            <Link underline="none" href="/about" className={styles.footerLink}>회사소개</Link>
                            <Link underline="none" href="/service" className={styles.footerLink}>서비스</Link>
                            <Link underline="none" href="/support" className={styles.footerLink}>고객센터</Link>
                            <Link underline="none" href="/policy" className={styles.footerLink}>이용약관</Link>
                        </Stack>
                    </Grid>

                    {/* 문의하기 */}
                    <Grid item xs={6} md={4}>
                        <Typography variant="overline" className={styles.heading}>
                            문의하기
                        </Typography>
                        <Stack spacing={0.6} sx={{ mt: 1.5 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Email: <Link href="mailto:support@squirrellogi.com" className={styles.footerLink}>support@squirrellogi.com</Link>
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Tel:&nbsp;02-1234-5678
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                서울특별시 ○○구 ○○로 123, 7F
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* 구분선 */}
            <Divider sx={{ borderColor: "rgba(255,255,255,.12)" }} />

            {/* 하단 바 */}
            <Container maxWidth="lg" sx={{ py: 2.5 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.2}
                >
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                        © 2025 Squirrel Logistics. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Link underline="none" href="/privacy" className={styles.footerSmallLink}>개인정보처리방침</Link>
                        <Link underline="none" href="/terms" className={styles.footerSmallLink}>이용약관</Link>
                        <Link underline="none" href="/sitemap" className={styles.footerSmallLink}>사이트맵</Link>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
