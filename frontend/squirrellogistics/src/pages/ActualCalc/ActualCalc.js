import { Box, Grid, Modal, Typography, useTheme } from "@mui/material";
import ActualMap from "../../components/actualCalc/ActualMap";
import PayBox from "../../components/payment/payBox";
import RemoveIcon from '@mui/icons-material/Remove';
import { Buttons } from "../../components/history/HistoryList";
import HelpIcon from '@mui/icons-material/Help';
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { act, useEffect, useState } from "react";
import { Layout, paymentFormat, Title } from "../../components/common/CommonForCompany";
import { actualCalc, getActualCalc, getEstimateCalc, trySecondPayment } from "../../api/company/actualCalcApi";
import { useSearchParams } from "react-router-dom";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import LoadingComponent from '../../components/common/LoadingComponent';
import { CommonTitle } from "../../components/common/CommonText";
import CommonList from "../../components/common/CommonList";
import { theme } from "../../components/common/CommonTheme";
import { ButtonContainer, Three100Buttons } from "../../components/common/CommonButton";

const ActualCalc = () => {
    const { moveToSecondPayment } = usePaymentMove();
    const { moveToReport } = useHistoryMove();
    const thisTheme = useTheme();

    const [params] = useSearchParams();
    const assignedId = params.get("assignedId");
    const reported = params.get("reported") === "true";

    const [modal, setModal] = useState(false);
    const [actualCalc, setActualCalc] = useState(null);
    const [baseRate, setBaseRate] = useState(0)
    const [additionalRate, setAdditionalRate] = useState(0);
    const [estimateCalc, setEstimateCalc] = useState(null);
    const [baseRateEstimate, setBaseRateEstimate] = useState(null);
    const [additionalRateEstimate, setAdditionalRateEstimate] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [paymentId, setPaymentId] = useState(0);
    const [loading, setLoading] = useState(false);

    const showTransactionStatement = () => {
        window.open(`${window.location.origin}/company/transactionStatement?paymentId=${actualCalc.paymentId}&token=${localStorage.getItem("accessToken")}`, 'name', 'width=1000, height=600');
    }


    useEffect(() => {
        setLoading(true);
        if (assignedId != 0) {
            getActualCalc({ assignedId })
                .then(data => {
                    setActualCalc(data);
                })
                .catch(err => {
                })
                .finally(setLoading(false));
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
        if (actualCalc.distance === 0) {
            setBaseRate(0);
        } else {
            setBaseRate(100000
                + (3000 * Math.ceil((actualCalc.distance) / 1000))
                + (Math.ceil((actualCalc.weight) / 1000) * 30000));
        }
        setRequestId(actualCalc.requestId);
        setPaymentId(actualCalc.paymentId);
    }, [actualCalc])

    useEffect(() => {
        if (assignedId != 0) {
            if (!modal) return;
            getEstimateCalc({ requestId })
                .then(data => {
                    setEstimateCalc(data);
                })
                .catch(err => {
                });
        }
    }, [modal])

    useEffect(() => {
        if (!estimateCalc) return; // 값 없으면 계산 안 함
        let additionalFee = 0;
        if (estimateCalc.dropOrderNum) additionalFee = estimateCalc.dropOrderNum * 50000;
        if (estimateCalc.handlingId === 1 || estimateCalc.handlingId === 3) additionalFee += 50000;
        if (estimateCalc.handlingId === 2 || estimateCalc.handlingId === 3) additionalFee += 50000;
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
        <>
            <CommonTitle>실 계산</CommonTitle>
            {loading && (
                <LoadingComponent open={loading} text="운송 기록을 불러오는 중..." />
            )}
            <Grid container spacing={3} marginBottom={10}>
                <Grid size={2} />
                <Grid size={5} height={"65vh"}>
                    <CommonList>
                        <ActualMap polyline={actualCalc?.actualPolyline}></ActualMap>
                    </CommonList>
                </Grid>
                <Grid size={3} height={"65vh"} overflow={"auto"}>
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
                            borderBottom: `2px solid ${theme.palette.text.secondary}`,
                            color: thisTheme.palette.text.primary
                        }}
                    >
                        <RemoveIcon />
                        <Typography
                            sx={{
                                fontWeight: "bold",
                                fontSize: `25px`,
                                marginRight: '2%',
                                display: "flex",
                                alignItems: "center",
                                color: thisTheme.palette.text.primary
                            }}
                        >
                            <HelpIcon cursor={"pointer"} onClick={() => setModal(true)} sx={{ color: theme.palette.text.secondary }} />&nbsp;
                            {paymentFormat(actualCalc?.estimateFee)}원
                        </Typography>
                        <Modal open={modal} onClose={() => setModal(false)}>
                            <Box sx={{
                                height: "100vh", width: "50%", position: "fixed", bgcolor: "background.paper",
                                display: "flex", justifyContent: "-moz-initial", alignItems: "center", flexDirection: "column", flexWrap: "wrap"
                                , maxWidth: "500px"
                            }}>
                                <Box margin={"10% 0"}>
                                    <CommonTitle>예상 금액</CommonTitle>
                                </Box>
                                <Box sx={{ width: "90%" }}>
                                    {estimateCalc && (
                                        <PayBox
                                            mileage={Math.ceil(estimateCalc.distance / 1000)}
                                            weight={estimateCalc.weight}
                                            baseRate={baseRateEstimate}
                                            stopOver1={estimateCalc.dropOrderNum >= 1}
                                            stopOver2={estimateCalc.dropOrderNum >= 2}
                                            stopOver3={estimateCalc.dropOrderNum >= 3}
                                            caution={estimateCalc.handlingId === 1 || estimateCalc.handlingId === 3}
                                            mountainous={estimateCalc.handlingId === 2 || estimateCalc.handlingId === 3}
                                            additionalRate={additionalRateEstimate}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Modal>
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
                                fontWeight: "bold",
                                fontSize: `25px`,
                                marginRight: '2%',
                                color: thisTheme.palette.text.primary
                            }}
                        >
                            총 {paymentFormat(actualCalc ? baseRate + additionalRate - actualCalc.estimateFee : 0)}원
                        </Typography>
                    </Box>
                    <ButtonContainer marginTop={2}>
                        <Three100Buttons
                            leftTitle={`신고${reported ? "완료" : ""}`}
                            leftClickEvent={() => moveToReport(assignedId)}
                            leftDisabled={reported}
                            leftColor={theme.palette.error.main}

                            middleTitle={"명세서"}
                            middleClickEvent={showTransactionStatement}

                            rightTitle={"정산"}
                            rightClickEvent={handlePayment}

                            gap={2}
                        />
                    </ButtonContainer>
                </Grid>
                <Grid size={2} />
            </Grid>
        </>
    )
}

export default ActualCalc;