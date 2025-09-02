// src/pages/Layout/Body.js
import { useRef, useState, useMemo } from "react";
import styles from "../../css/Body.module.css";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Stack,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 필요에 따라 svg/jpg로 바꿔 쓰세요
const bannerImages = [
    { src: "/images/banner1.jpeg", title: "프로모션 1", desc: "첫번째 배너" },
    { src: "/images/banner2.jpeg", title: "프로모션 2", desc: "두번째 배너" },
    { src: "/images/banner3.jpeg", title: "프로모션 3", desc: "세번째 배너" },
];

export default function Body({ fullBleed = false }) {
    // fullBleed=true 로 넘기면 화면 꽉 차는 히어로
    const sliderRef = useRef(null);
    const [current, setCurrent] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const isSm = useMediaQuery("(max-width:900px)");

    const thisTheme = useTheme();

    const sliderSettings = useMemo(
        () => ({
            dots: false,
            infinite: true,
            speed: 700,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay,
            autoplaySpeed: 4500,
            pauseOnHover: true,
            arrows: false,
            beforeChange: (_, next) => setCurrent(next),
            accessibility: true,
        }),
        [autoplay]
    );

    const go = (i) => sliderRef.current?.slickGoTo(i);
    const prev = () => sliderRef.current?.slickPrev();
    const next = () => sliderRef.current?.slickNext();

    return (
        <Box className={fullBleed ? styles.wrapFull : styles.wrapWide}>
            <Box className={styles.hero}>
                <Slider ref={sliderRef} {...sliderSettings}>
                    {bannerImages.map((b, i) => (
                        <Box key={i} className={styles.slide} role="img" aria-label={b.title}>
                            <img src={b.src} alt={b.title} className={styles.bg} />
                            <div className={styles.overlay} />

                            <Box className={styles.textBlock}>
                                <Chip label="물류 중개 플랫폼" size="small" className={styles.badge} />
                                <Typography variant={isSm ? "h4" : "h3"} fontWeight={800} lineHeight={1.15}>
                                    즉시 견적부터 예약·정산까지
                                    <br />하나의 플랫폼에서.
                                </Typography>
                                <Typography variant="body1" className={styles.desc}>
                                    실시간 커뮤니케이션과 직관적 대시보드로 복잡한 물류를 간편하게.
                                </Typography>
                                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                                    <Button variant="contained" size={isSm ? "medium" : "large"}>
                                        지금 시작하기
                                    </Button>
                                    <Button variant="outlined" size={isSm ? "medium" : "large"} href="/service">
                                        서비스 보기
                                    </Button>
                                </Stack>
                            </Box>
                        </Box>
                    ))}
                </Slider>

                <IconButton className={`${styles.ctrl} ${styles.left}`} onClick={prev} aria-label="이전">
                    <ArrowBackIosNewIcon />
                </IconButton>
                <IconButton className={`${styles.ctrl} ${styles.right}`} onClick={next} aria-label="다음">
                    <ArrowForwardIosIcon />
                </IconButton>
                <IconButton
                    className={`${styles.ctrl} ${styles.play}`}
                    onClick={() => setAutoplay((v) => !v)}
                    aria-label={autoplay ? "자동재생 중지" : "자동재생 시작"}
                >
                    {autoplay ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>

                <Box className={styles.indicator}>
                    {bannerImages.map((_, i) => (
                        <Button
                            key={i}
                            size="small"
                            variant={current === i ? "contained" : "outlined"}
                            onClick={() => go(i)}
                            className={styles.dotBtn}
                        >
                            {i + 1}
                        </Button>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
