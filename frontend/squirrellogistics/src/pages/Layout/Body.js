// src/pages/Layout/Body.js
import { useRef, useState, useMemo, useEffect } from "react";
import {
    Box, Typography, Button, IconButton, Chip, Stack,
    useMediaQuery, useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getPublicBanners } from "../../api/admin/bannerApi";
import { OneButtonAtLeft } from "../../components/common/CommonButton";
import { useNavigate } from "react-router-dom";
import API_SERVER_HOST from "../../api/apiServerHost";

const bannerImages = [
    { src: "/images/banner1.jpeg", title: "프로모션 1", desc: "첫번째 배너" },
    { src: "/images/banner2.jpeg", title: "프로모션 2", desc: "두번째 배너" },
    { src: "/images/banner3.jpeg", title: "프로모션 3", desc: "세번째 배너" },
];

export default function Body({ fullBleed = false }) {
    const sliderRef = useRef(null);
    const [current, setCurrent] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down("md"));
    const [banners, setBanners] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getPublicBanners();
                setBanners(res.data);
                console.log(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [])

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

    const detailNotice = (noticeId)=>{
        navigate(`/admin/notice/read/${noticeId}`);
    }

    const go = (i) => sliderRef.current?.slickGoTo(i);
    const prev = () => sliderRef.current?.slickPrev();
    const next = () => sliderRef.current?.slickNext();

    return (
        <Box sx={{ width: "100%" }}>
            {/* 데스크톱에서 카드형 컨테이너로 감싸기 */}
            <Box sx={{ px: { xs: 0, md: 8, lg: 16, xl: 30 }, py: { xs: 0, md: 3 } }}>
                <Box
                    sx={{
                        position: "relative",
                        height: { xs: 280, sm: 360, md: 520, lg: 600 },
                        overflow: "hidden",
                        borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: "none" },

                        // ✅ 데스크톱 카드 모양
                        borderRadius: { xs: 0, md: 4 },
                        boxShadow: {
                            xs: "none",
                            md: "0 18px 48px rgba(0,0,0,.18), 0 6px 18px rgba(0,0,0,.08)",
                        },
                        backgroundColor: theme.palette.grey[900],

                        // ✅ react-slick 높이 문제 고정
                        "& .slick-slider": { height: "100%", marginBottom: "0!important" },
                        "& .slick-list, & .slick-track": { height: "100%" },
                        "& .slick-slide, & .slick-slide > div": { height: "100%" },
                    }}
                >
                    <Slider ref={sliderRef} {...sliderSettings}>
                        {banners?.map((b, i) => (
                            <Box key={i} sx={{ width: "100%", height: "100%", position: "relative" }}>
                                {/* 배경 이미지 */}
                                <Box
                                    component="img"
                                    src={`${b.imageUrl}`}
                                    // src={`${API_SERVER_HOST}/public/banner/${b.imageUrl}`}
                                    alt={b.title}
                                    loading="lazy"
                                    decoding="async"
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        objectPosition: "center",
                                        display: "block",
                                        filter: { md: "saturate(1.05)" },
                                    }}
                                />

                                {/* 상단 좌→우 그라디언트 + 하단 그라디언트 */}
                                {/* <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "linear-gradient(90deg, rgba(0,0,0,.45), rgba(0,0,0,.18), transparent)",
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.25))",
                                    }}
                                /> */}

                                {/* 우상단 큰 원(워터마크용) — md 이상에서만 */}
                                <Box
                                    sx={{
                                        display: { xs: "none", md: "block" },
                                        position: "absolute",
                                        width: 520,
                                        height: 520,
                                        top: -120,
                                        right: -80,
                                        borderRadius: "50%",
                                        background:
                                            "radial-gradient(circle at 30% 30%, rgba(255,255,255,.22), rgba(255,255,255,.06) 55%, transparent 60%)",
                                        mixBlendMode: "screen",
                                        pointerEvents: "none",
                                    }}
                                />

                                {/* 좌상단 워터마크 타이틀 — md 이상에서만 */}
                                <Typography
                                    sx={{
                                        display: { xs: "none", md: "block" },
                                        position: "absolute",
                                        left: { md: 40, lg: 56 },
                                        top: { md: 40, lg: 56 },
                                        color: "rgba(255,255,255,.45)",
                                        fontWeight: 800,
                                        letterSpacing: ".4px",
                                        textShadow: "0 2px 6px rgba(0,0,0,.25)",
                                        fontSize: { md: "clamp(36px, 5.2vw, 72px)" },
                                        userSelect: "none",
                                    }}
                                >
                                    Squirrel Logistics
                                </Typography>

                                {/* 실제 텍스트 컨텐츠 */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        px: { xs: 2, sm: 4, md: 6, lg: 8 },
                                        marginTop: 10
                                    }}
                                >
                                    <Box sx={{ maxWidth: 760, color: "#fff" }}>

                                        <Typography
                                            fontWeight={800}
                                            lineHeight={1.15}
                                            sx={{
                                                fontSize: {
                                                    xs: "clamp(18px,6.5vw,28px)",
                                                    md: "clamp(34px,3.8vw,56px)",
                                                },
                                                textShadow: "0 3px 12px rgba(0,0,0,.35)",
                                            }}
                                        >
                                            {b.title}

                                        </Typography>

                                        <Typography
                                            variant="body1"
                                            sx={{ opacity: 0.95, mt: 1, textShadow: "0 2px 8px rgba(0,0,0,.35)" }}
                                        >
                                            {b.subTitle}
                                        </Typography>

                                        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                                            <Button variant="contained" size={isSm ? "medium" : "large"} 
                                                onClick={()=>detailNotice(b.noticeId)}
                                            >
                                                상세보기
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Slider>

                    {/* 좌/우 화살표 — 둥근 글래스 버튼 */}
                    <IconButton
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: { xs: 6, md: 16 },
                            transform: "translateY(-50%)",
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            color: "#fff",
                            bgcolor: alpha("#000", 0.35),
                            border: "1px solid rgba(255,255,255,.35)",
                            backdropFilter: "blur(6px)",
                            boxShadow: 2,
                            "&:hover": { bgcolor: alpha("#000", 0.55) },
                        }}
                        onClick={prev}
                        aria-label="이전"
                    >
                        <ArrowBackIosNewIcon />
                    </IconButton>
                    <IconButton
                        sx={{
                            position: "absolute",
                            top: "50%",
                            right: { xs: 6, md: 16 },
                            transform: "translateY(-50%)",
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            color: "#fff",
                            bgcolor: alpha("#000", 0.35),
                            border: "1px solid rgba(255,255,255,.35)",
                            backdropFilter: "blur(6px)",
                            boxShadow: 2,
                            "&:hover": { bgcolor: alpha("#000", 0.55) },
                        }}
                        onClick={next}
                        aria-label="다음"
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>

                    {/* 재생/일시정지 버튼 */}
                    <IconButton
                        sx={{
                            position: "absolute",
                            bottom: { xs: 8, md: 16 },
                            right: { xs: 8, md: 16 },
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            color: "#fff",
                            bgcolor: alpha("#000", 0.35),
                            border: "1px solid rgba(255,255,255,.35)",
                            backdropFilter: "blur(6px)",
                            boxShadow: 2,
                            "&:hover": { bgcolor: alpha("#000", 0.55) },
                        }}
                        onClick={() => setAutoplay((v) => !v)}
                        aria-label={autoplay ? "자동재생 중지" : "자동재생 시작"}
                    >
                        {autoplay ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>

                    {/* 숫자형 인디케이터 (카드 내부 좌하단) */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: { xs: 8, md: 16 },
                            left: { xs: 8, md: 16 },
                            display: "flex",
                            gap: 1,
                        }}
                    >
                        {banners?.map((_, i) => (
                            <Button
                                key={i}
                                size="small"
                                variant={current === i ? "contained" : "outlined"}
                                onClick={() => go(i)}
                                sx={{
                                    minWidth: 28,
                                    px: 1,
                                    color: "#fff",
                                    borderColor: "rgba(255,255,255,.6)",
                                    "&.MuiButton-contained": {
                                        bgcolor: "rgba(255,255,255,.22)",
                                        borderColor: "transparent",
                                        backdropFilter: "blur(4px)",
                                    },
                                }}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
