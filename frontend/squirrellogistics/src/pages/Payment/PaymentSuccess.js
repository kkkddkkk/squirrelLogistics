import { Box, Button, Grid, Typography, useTheme, } from "@mui/material"
import React, { useEffect, useState } from "react"
import usePaymentMove from "../../hook/paymentHook/usePaymentMove"
import { useSearchParams } from "react-router-dom"
import { Layout } from "../../components/common/CommonForCompany"
import { failureSecondPayment, successSecondPayment } from "../../api/company/paymentApi"
import Logo from '../../components/common/squirrelLogisticsLogo.png';
import darkLogo from '../../components/common/squirrelLogisticsLogo_dark.png';
import { ButtonContainer, Three100Buttons, Two100Buttons } from "../../components/common/CommonButton"


const PaymentSuccess = () => {
    const thisTheme = useTheme();
    const [params] = useSearchParams();
    const success = params.get("success");
    const paymentId = params.get("paymentId");
    const { moveToMain, moveToHistory, moveBack } = usePaymentMove();

    const showReciept = () => {
        window.open(`${window.location.origin}/company/reciept?paymentId=${paymentId}&token=${localStorage.getItem("accessToken")}`, 'name', 'width=500, height=600');
    }

    const PsButton = ({ children, func }) => {
        return (
            <Button
                variant="contained"
                sx={{ width: success === "true" ? "30%" : "40%" }}
                onClick={func}
            >
                {children}
            </Button>
        );
    }

    const [paymentSuccessDTO, setPaymentSuccessDTO] = useState({
        paymentId: paymentId,
        paid: '',
        payStatus: 'PROCESSING'
    });

    const [paymentFailureDTO, setPaymentFailureDTO] = useState({
        paymentId: paymentId,
        payStatus: 'PROCESSING',
        failureReason: ''
    });

    useEffect(() => {
        if (success === "true") {
            successSecondPayment({ paymentId, paymentSuccessDTO })
                .then(data => {
                    console.log("결제 성공 처리 성공");
                })
                .catch(err => {
                    console.error("수정 실패", err);
                });
        } else {
            failureSecondPayment({ paymentId, paymentFailureDTO })
                .then(data => {
                    console.log("결제 실패 처리 성공");
                })
                .catch(err => {
                    console.error("수정 실패", err);
                });
        }
    }, [])

    return (

        <Grid container display={"flex"} justifyContent={"center"} flexWrap={"wrap"} marginTop={"10%"}>
            <Grid size={3}/>
            <Grid size={6} display={"flex"} justifyContent={"center"} flexWrap={"wrap"}>
                <Box
                    component="img"
                    sx={{
                        width: "40%",
                        // margin: "15% 0"
                    }}
                    alt="LOGO"
                    src={thisTheme.palette.mode==="light"?Logo:darkLogo}
                >
                </Box>
                <Typography
                    sx={{
                        width: "100%",
                        textAlign: "center",
                        fontSize: "20px",
                        marginTop: "5%"
                    }}
                >{success === "true" ? "결제가 완료되었습니다." : "결제에 실패하였습니다."}</Typography>

                <ButtonContainer width={"100%"} marginTop={"5%"} marginBottom={"10%"}>
                    {success === "true" ?
                        <Three100Buttons
                            leftTitle={"메인화면"}
                            leftClickEvent={() => moveToMain()}
                            middleTitle={"내 이용기록"}
                            middleClickEvent={() => moveToHistory()}
                            rightTitle={"영 수 증"}
                            rightClickEvent={showReciept}
                            gap={2}
                        /> :
                        <Two100Buttons
                            leftTitle={"메인화면"}
                            leftClickEvent={() => moveToMain()}
                            rightTitle={"다시 결제"}
                            rightClickEvent={() => moveBack()}
                            gap={2}
                        />
                    }
                </ButtonContainer>
            </Grid>
            <Grid size={3}/>
        </Grid>

    );

}

export default PaymentSuccess;