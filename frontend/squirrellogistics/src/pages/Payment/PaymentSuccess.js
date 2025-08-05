import { Box, Button, Modal, Typography } from "@mui/material"
import { BGBox } from "./PaymentLayout"
import React, { useEffect, useRef, useState } from "react"
import usePaymentMove from "../../hook/paymentHook/usePaymentMove"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Reciept } from "./Reciept"
import { TransactionStatement } from "../../components/payment/TransactionStatement"

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

    const showReciept = () => {
        window.open(`${window.location.origin}/reciept`, 'name', 'width=500, height=600');
    }


    //모달(임시)
    const [isOpen, setIsOpen] = useState(false);
    
    const handlePrint=()=>{
        window.print();
    }

    return (
        <BGBox title={''}>
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

                <PsButton func={() => {
                    setIsOpen(true)
                }}>임시버튼</PsButton>

                <PsButton func={() => {
                    moveToHistory();
                }}>History</PsButton>

                {/* 임시모달 */}
                <Modal
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"

                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 950,
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap"
                    }}>
                        <Box
                            sx={{
                                width: "90%",
                            }}
                            visibility={"visible"}
                        >
                            <TransactionStatement></TransactionStatement>
                        </Box>
                        <Box sx={{ width: "50%", display: "flex", justifyContent: "space-between", marginTop: "5%" }}>
                            <PsButton func={() => setIsOpen(true)}>내보내기</PsButton>
                            <PsButton func={handlePrint}>인 쇄</PsButton>
                        </Box>

                    </Box>
                </Modal>

            </Box>
        </BGBox >
    );

}

export default PaymentSuccess;