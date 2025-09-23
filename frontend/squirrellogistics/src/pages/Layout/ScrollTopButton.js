import { useEffect, useState } from "react";
import { Fab, Zoom, Portal } from "@mui/material";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

export default function ScrollTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <Portal>
            <Zoom in={visible} unmountOnExit>
                <Fab
                    color="primary"
                    onClick={scrollToTop}
                    size="medium"
                    aria-label="scroll top"
                    sx={{
                        position: "fixed",
                        // iOS 안전영역 고려 + 반응형 여백
                        right: { xs: `calc(16px + env(safe-area-inset-right))`, md: 24 },
                        bottom: { xs: `calc(16px + env(safe-area-inset-bottom))`, md: 24 },
                        zIndex: (t) => t.zIndex.tooltip + 1, // 거의 최상단
                    }}
                >
                    <KeyboardDoubleArrowUpIcon />
                </Fab>
            </Zoom>
        </Portal>
    );
}
