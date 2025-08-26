import { Box, Modal, Typography } from "@mui/material";
import ActualMap from "../../components/actualCalc/ActualMap";
import PayBox from "../../components/payment/payBox";
import RemoveIcon from '@mui/icons-material/Remove';
import { Buttons } from "../../components/history/HistoryList";
import HelpIcon from '@mui/icons-material/Help';
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { useEffect, useState } from "react";
import { Layout, paymentFormat, Title } from "../../components/common/CommonForCompany";
import { actualCalc, getActualCalc, getEstimateCalc, trySecondPayment } from "../../api/company/actualCalcApi";
import { useSearchParams } from "react-router-dom";

const ActualCalc = () => {
    const { moveToSecondPayment } = usePaymentMove();


    const [params] = useSearchParams();
    const assignedId = params.get("assignedId");

    const [modal, setModal] = useState(false);
    const [actualCalc, setActualCalc] = useState(null);
    const [baseRate, setBaseRate] = useState(0)
    const [additionalRate, setAdditionalRate] = useState(0);
    const [estimateCalc, setEstimateCalc] = useState(null);
    const [baseRateEstimate, setBaseRateEstimate] = useState(null);
    const [additionalRateEstimate, setAdditionalRateEstimate] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [paymentId, setPaymentId] = useState(0);

    const showTransactionStatement = () => {
        window.open(`${window.location.origin}/company/transactionStatement`, 'name', 'width=1000, height=600');
    }

    useEffect(() => {
        if (assignedId != 0) {
            getActualCalc({ assignedId })
                .then(data => {
                    setActualCalc(data);
                    console.log(data);
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                });
        }
    }, []);

    useEffect(() => {
        if (!actualCalc) return;
        let addThisRate = 0;
        if (actualCalc.dropOrder1) addThisRate += 50000;
        if (actualCalc.dropOrder2) addThisRate += 50000;
        if (actualCalc.dropOrder3) addThisRate += 50000;
        if (actualCalc.caution) addThisRate += 50000;
        if (actualCalc.mountainous) addThisRate += 50000;
        setAdditionalRate(addThisRate)
        setBaseRate(100000
            + (3000 * Math.ceil((actualCalc.distance) / 1000))
            + ((actualCalc.weight) * 30000));
        setRequestId(actualCalc.requestId);
        setPaymentId(actualCalc.paymentId);
    }, [actualCalc])

    useEffect(() => {
        if (assignedId != 0) {
            if (!modal) return;
            getEstimateCalc({ requestId })
                .then(data => {
                    setEstimateCalc(data);
                    console.log(data);
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                });
        }
    }, [modal])

    useEffect(() => {
        if (!estimateCalc) return; // 값 없으면 계산 안 함
        let additionalFee;
        if (estimateCalc.dropOrderNum) additionalFee = estimateCalc.dropOrderNum * 50000;
        if (estimateCalc.mountainous) additionalFee += 50000;
        if (estimateCalc.caution) additionalFee += 50000;
        setAdditionalRateEstimate(additionalFee);
        setBaseRateEstimate(
            100000
            + (3000 * Math.ceil((estimateCalc.distance) / 1000))
            + Math.ceil(estimateCalc.weight / 1000) * 30000
        );
    }, [estimateCalc]);

    const handlePayment = () => {
        if (assignedId != 0)
            moveToSecondPayment(paymentId);
    }


    return (
        <Layout title={"실 계산"}>
            <Box
                sx={{
                    width: "70%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignContent: "center"
                }}
            >
                <Box sx={{ width: "40%" }}>
                    {/* <ActualMap polyline={actualCalc?.actualPolyline}></ActualMap> */}
                </Box>
                <Box sx={{ width: "45%", aspectRatio: "1/1", overflow: "auto" }}>
                    <PayBox
                        mileage={actualCalc ? Math.ceil(actualCalc.distance / 1000) : 0}
                        weight={actualCalc ? actualCalc.weight : 0}
                        baseRate={actualCalc ? baseRate : 0}
                        stopOver1={actualCalc ? actualCalc.dropOrder1 : false}
                        stopOver2={actualCalc ? actualCalc.dropOrder2 : false}
                        stopOver3={actualCalc ? actualCalc.dropOrder3 : false}
                        caution={actualCalc ? actualCalc.caution : false}
                        mountainous={actualCalc ? actualCalc.mountainous : false}
                        additionalRate={actualCalc ? additionalRate : 0}
                    />
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
                                <Box sx={{
                                    height: "100vh", width: "50%", position: "fixed", bgcolor: "background.paper",
                                    display: "flex", justifyContent: "center", flexWrap: "wrap"
                                    , maxWidth: "500px"
                                }}>
                                    <Title>예상금액</Title>
                                    <Box sx={{ width: "90%" }}>
                                        {estimateCalc && (
                                            <PayBox
                                                mileage={Math.ceil(estimateCalc.distance / 1000)}
                                                weight={estimateCalc.weight}
                                                baseRate={baseRateEstimate}
                                                stopOver1={estimateCalc.dropOrderNum>=1}
                                                stopOver2={estimateCalc.dropOrderNum >= 2}
                                                stopOver3={estimateCalc.dropOrderNum >=3}
                                                caution={estimateCalc.handlingId === 11 || estimateCalc.handlingId === 13}
                                                mountainous={estimateCalc.handlingId === 12 || estimateCalc.handlingId === 13}
                                                additionalRate={additionalRateEstimate}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Modal>
                            {paymentFormat(actualCalc?.estimateFee)}원
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
                            총 {paymentFormat(actualCalc?baseRate+additionalRate-actualCalc.estimateFee:0)}원
                        </Typography>
                    </Box>
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "end", margin: "5% 0" }}>
                        <Buttons>신고</Buttons>
                        <Buttons func={showTransactionStatement}>명세서</Buttons>
                        <Buttons func={handlePayment}>정 산</Buttons>
                    </Box>
                </Box>

            </Box >
        </Layout>
    )
}

export default ActualCalc;