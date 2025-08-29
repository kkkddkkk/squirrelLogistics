import { Box, Button, Grid, Typography, } from "@mui/material"
import React, { useEffect, useState } from "react"
import usePaymentMove from "../../hook/paymentHook/usePaymentMove"
import { useSearchParams } from "react-router-dom"
import { Layout } from "../../components/common/CommonForCompany"
import { failureSecondPayment, successSecondPayment } from "../../api/company/paymentApi"
import Logo from '../../components/common/squirrelLogisticsLogo.png';

// export const showReciept = () => {
//     window.open(`${window.location.origin}/company/reciept`, 'name', 'width=500, height=600');
// }

const PaymentSuccess = () => {
    const [params] = useSearchParams();
    const success = params.get("success");
    const paymentId = params.get("paymentId");
    const { moveToMain, moveToHistory, moveBack } = usePaymentMove();

    const showReciept = () => {
        window.open(`${window.location.origin}/company/reciept?paymentId=${paymentId}`, 'name', 'width=500, height=600');
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
        <Layout>
            <Grid container display={"flex"} justifyContent={"center"} flexWrap={"wrap"} marginTop={"10%"}>
                {/* <Grid size={3}/> */}
                <Grid size={12} display={"flex"} justifyContent={"center"} flexWrap={"wrap"}>
                    <Box
                        component="img"
                        sx={{
                            width: "80%",
                            // margin: "15% 0"
                        }}
                        alt="LOGO"
                        src={Logo}
                    >
                    </Box>
                    <Typography
                        sx={{
                            fontSize: "20px",
                            marginTop: "5%"
                        }}                    
                    >{success==="true"?"결제가 완료되었습니다.":"결제에 실패하였습니다."}</Typography>

                    <Box
                        sx={{
                            width: success === "true" ? "90%" : "60%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "10% 0"
                        }}
                    >
                        <PsButton func={() => moveToMain()}>메인화면</PsButton>
                        {success === "true" ? <PsButton func={() => moveToHistory()}>내 이용기록</PsButton>
                            : <></>}
                        {success === "true" ? <PsButton func={showReciept}>영 수 증 </PsButton>
                            : <PsButton func={() => moveBack()}>다시 결제 </PsButton>}
                    </Box>

                </Grid>
                {/* <Grid size={3}/> */}
            </Grid>
        </Layout >
    );

}

export default PaymentSuccess;