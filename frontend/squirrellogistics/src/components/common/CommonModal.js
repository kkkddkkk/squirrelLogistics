import { Box, Button, Grid, Typography } from "@mui/material"
import { theme } from "./CommonTheme";
import { lighten, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import TwoButtonPopupComponent from "../deliveryRequest/TwoButtonPopupComponent";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import LoginModal from "../../pages/Layout/LoginModal";


export const LogOutModal = ({ open }) => {
    const { moveToMain } = usePaymentMove();

    const [loginOpen, setLoginOpen] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [user, setUser] = useState({
        name: localStorage.getItem("userName") || null,
        role: localStorage.getItem("userRole") || null,
        token: localStorage.getItem("accessToken") || null,
    });
    useEffect(() => {
        setSessionExpired(open);
    }, [open]);

    const handleLoggedIn = (data) => {
        setUser({
            name: data?.name || localStorage.getItem("userName"),
            role: data?.role || localStorage.getItem("userRole"),
            token: data?.accessToken || localStorage.getItem("accessToken"),
        });
        setLoginOpen(false);
    };

    return (
        <>
            <TwoButtonPopupComponent
                open={sessionExpired}
                leftTxt="메인화면"
                rightTxt="다시 로그인하기"
                onLeftClick={() => moveToMain()}
                onRightClick={() => {
                    setSessionExpired(false);
                    setLoginOpen(true);
                }}

                title={"로그인 유지 시간이 만료되어 자동으로 로그아웃 되었습니다."}
                content={"로그인이 필요한 경우, '다시 로그인하기'버튼을 눌러주세요."}
            />
            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onLoggedIn={handleLoggedIn}
            />
        </>

    );
}



