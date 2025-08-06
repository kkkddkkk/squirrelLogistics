import { Box, Button, Modal, Typography } from "@mui/material"
import { BGBox } from "./PaymentLayout"
import React, { useEffect, useRef, useState } from "react"
import usePaymentMove from "../../hook/paymentHook/usePaymentMove"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Reciept } from "./Reciept"
import TransactionStatement from "../../pages/Payment/TransactionStatement"

export const showReciept = () => {
    window.open(`${window.location.origin}/reciept`, 'name', 'width=500, height=600');
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

    //모달(임시)
    const [isOpen, setIsOpen] = useState(false);

    const handlePrint = () => {
        window.print();
    }

    return (
        <BGBox>
            <Box width={"60%"} maxWidth={"700px"}>
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
            </Box>
        </BGBox >
    );

}

export default PaymentSuccess;