import { useRef, useState } from "react";
import styles from "../../css/Body.module.css";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const bannerImages = [
    { src: "/images/banner1.jpg", title: "프로모션 1", desc: "첫번째 배너" },
    { src: "/images/banner2.jpg", title: "프로모션 2", desc: "두번째 배너" },
    { src: "/images/banner3.jpg", title: "프로모션 3", desc: "세번째 배너" },
];

export default function Body() {
    const sliderRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        arrows: false,
        beforeChange: (_, next) => setCurrentSlide(next),
    };

    return (
        <Box className={styles.bannerSection}>
            <Box className={styles.sliderContainer}>
                <Slider ref={sliderRef} {...sliderSettings}>
                    {bannerImages.map((img, i) => (
                        <Box key={i} sx={{ position: "relative" }}>
                            <img src={img.src} alt={img.title} className={styles.bannerImage} />
                            <div className={styles.bannerTextOverlay}>
                                <Typography variant="h4">{img.title}</Typography>
                                <Typography>{img.desc}</Typography>
                            </div>
                        </Box>
                    ))}
                </Slider>

                {/* 👇 여기가 버튼이 배너 안에 위치하게 만든 핵심! */}
                <Box className={styles.sliderButtons}>
                    {bannerImages.map((_, i) => (
                        <Button
                            key={i}
                            size="small"
                            variant={currentSlide === i ? "contained" : "outlined"}
                            color="primary"
                            sx={{ mr: 1 }}
                            onClick={() => sliderRef.current.slickGoTo(i)}
                        >
                            {i + 1}
                        </Button>
                    ))}
                </Box>
            </Box>


            {/* 오른쪽 고정 계산기 */}
            <Paper elevation={6} className={styles.fixedCalculator}>
                <Typography variant="h6" gutterBottom>화물 견적 계산기</Typography>
                <TextField label="출발지" fullWidth margin="dense" />
                <TextField label="도착지" fullWidth margin="dense" />
                <TextField label="화물정보" fullWidth margin="dense" />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField label="무게" type="number" fullWidth margin="dense" />
                    <Typography sx={{ ml: 1 }}>KG</Typography>
                </Box>
                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    예상 견적조회
                </Button>
            </Paper>
        </Box>
    );
}
