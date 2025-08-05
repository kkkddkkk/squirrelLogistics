import { useEffect, useState } from "react";
import { Fab } from "@mui/material";
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

export default function ScrollTopButton() {
    const [visible, setVisible] = useState(false);

    // 스크롤 감지
    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > 300); // 300px 이상 스크롤 시 표시
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!visible) return null;

    return (
        <Fab
            color="primary"
            onClick={scrollToTop}
            sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 9999,
            }}
            size="medium"
            aria-label="scroll top"
        >
            <KeyboardDoubleArrowUpIcon />
        </Fab>
    );
}
