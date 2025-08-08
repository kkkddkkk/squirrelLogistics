import { Box, Button, Grid, Modal, Typography } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import usePaymentMove from "../../hook/paymentHook/usePaymentMove"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Layout } from "../../components/common/CommonForCompany"

export const showReciept = () => {
    window.open(`${window.location.origin}/company/reciept`, 'name', 'width=500, height=600');
}

const PaymentSuccess = () => {
    const [params] = useSearchParams();
    const success = params.get("success");
    const { moveToMain, moveToHistory, moveBack } = usePaymentMove();

    const PsButton = ({ children, func }) => {
        return (
            <Button
                variant="contained"
                sx={{ width: "25%" }}
                onClick={func}
            >
                {children}
            </Button>
        );
    }

    return (
        <Layout>
            <Grid container display={"flex"} justifyContent={"center"} flexWrap={"wrap"} marginTop={"5%"}>
                <Grid size={3}/>
                <Grid size={6}>
                    <Box
                        component="img"
                        sx={{
                            height: 400,
                            width: "100%",
                            marginTop: "2%"
                        }}
                        alt="OtterImg"
                        src="https://www.otterspecialistgroup.org/osg-newsite/wp-content/uploads/2017/04/ThinkstockPhotos-827261360-2000x1200.jpg"
                    >
                    </Box>

                    <Box
                        sx={{
                            width: "90%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "5%"
                        }}
                    >
                        <PsButton func={() => moveToMain()}>메인화면</PsButton>
                        {success === "true" ? <PsButton func={() => moveToHistory()}>내 이용기록</PsButton>
                            : <></>}
                        {success === "true" ? <PsButton func={showReciept}>영 수 증 </PsButton>
                            : <PsButton func={() => moveBack()}>다시 결제하기 </PsButton>}
                    </Box>

                </Grid>
                <Grid size={3}/>
            </Grid>
        </Layout >
    );

}

export default PaymentSuccess;