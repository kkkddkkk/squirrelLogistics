import { Box, Modal, Typography } from "@mui/material";
import ActualMap from "../../components/actualCalc/ActualMap";
import PayBox from "../../components/payment/payBox";
import RemoveIcon from '@mui/icons-material/Remove';
import { Buttons } from "../../components/history/HistoryList";
import HelpIcon from '@mui/icons-material/Help';
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { useState } from "react";
import { TitleForCharge } from "../Payment/Payment";

const ActualCalc = () => {
    const { moveToPayment } = usePaymentMove();

    const showTransactionStatement = () => {
        window.open(`${window.location.origin}/payment/transactionStatement`, 'name', 'width=1000, height=600');
    }

    const [modal, setModal] = useState(false);
    const handleClickHelp = () => {
        setModal(true);
    }

    return (
        <Box
            sx={{
                width: "90%",
                display: "flex",
                justifyContent: "space-between",
                alignContent: "center"
            }}
        >
            <Box sx={{ width: "45%" }}>
                <ActualMap></ActualMap>
            </Box>
            <Box sx={{ width: "45%" }}>
                <PayBox all={true}></PayBox>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "5%",
                        paddingBottom: "5%",
                        borderBottom: "2px solid #909095"
                    }}
                >
                    <RemoveIcon />
                    <Typography
                        sx={{
                            color: "#2A2A2A",
                            fontWeight: "bold",
                            fontSize: `25px`,
                            marginRight: '2%',
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <HelpIcon cursor={"pointer"} onClick={() => setModal(true)} color="#909095" />&nbsp;
                        <Modal open={modal} onClose={() => setModal(false)}
                        >
                            <Box sx={{ height: "100vh", width: "50%", position: "fixed", bgcolor: "background.paper",
                                display: "flex", justifyContent: "center", flexWrap: "wrap"
                                ,maxWidth: "500px"
                             }}>
                                <TitleForCharge> 예상금액 </TitleForCharge>
                            <Box sx={{ width: "90%" }}>
                                <PayBox></PayBox>
                            </Box>
                        </Box>
                    </Modal>
                        00원

                </Typography>

            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "end",
                }}
            >
                <Typography
                    sx={{
                        color: "#2A2A2A",
                        fontWeight: "bold",
                        fontSize: `25px`,
                        marginRight: '2%'
                    }}
                >
                    총 000원
                </Typography>

            </Box>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "end", margin: "5% 0" }}>
                <Buttons>신고</Buttons>
                <Buttons func={showTransactionStatement}>명세서</Buttons>
                <Buttons func={moveToPayment}>정 산</Buttons>
            </Box>
        </Box>

        </Box >

    )
}

export default ActualCalc;