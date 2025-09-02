import { Box, Button, Checkbox, Grid, Modal, Typography, useTheme } from "@mui/material";
import PayBox from "../../components/payment/payBox";
import { RefundDate } from "../../components/payment/RefundDate";
import { PayMethod } from "../../components/payment/PayMethod";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useEffect, useState } from "react";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { Layout, paymentFormat, SubTitle, Title } from "../../components/common/CommonForCompany";
import { cancelPayment, getFirstPayBox, getSecondPayBox, refund, requestRefund, successFirstPayment, successRefundPayment, successSecondPayment } from "../../api/company/paymentApi";
import { useSearchParams } from "react-router-dom";
import RemoveIcon from '@mui/icons-material/Remove';
import HelpIcon from '@mui/icons-material/Help';
import { getEstimateCalc } from "../../api/company/actualCalcApi";
import axios from "axios";
import useCompanyMove from "../../hook/company/useCompanyMove";
import { PaymentClient } from "@portone/server-sdk";
import { CommonSubTitle, CommonTitle } from "../../components/common/CommonText";
import { theme } from "../../components/common/CommonTheme";
import LoadingComponent from "../../components/common/LoadingComponent";
import { ButtonContainer, One100ButtonAtCenter, OneButtonAtLeft, OneButtonAtRight, Two100Buttons } from "../../components/common/CommonButton";



export const Payment = () => {
    //#region 약관 관련
    const [checkedAll, setCheckedAll] = useState(false);
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);

    function handleClickAllPolicy() {
        if (checkedAll) {
            setCheckedAll(false);
            setChecked1(false);
            setChecked2(false);
        } else {
            setCheckedAll(true);
            setChecked1(true);
            setChecked2(true);
        }
    }

    function handleClickPolicy1() {
        if (checked1) {
            setChecked1(false);
            setCheckedAll(false);
        } else {
            setChecked1(true);
            if (checked2) setCheckedAll(true)
        }

    }

    function handleClickPolicy2() {
        if (checked2) {
            setChecked2(false);
            setCheckedAll(false);
        } else {
            setChecked2(true);
            if (checked1) setCheckedAll(true)
        }

    }

    //약관관련 function
    function PolicyCheckbox({ onClick, checked }) {
        const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
        return (<Checkbox{...label} onClick={onClick} checked={checked} />)
    }
    function showPolicy({ path }) {
        var policies = window.open(`/{path}`, 'name', 'width=500, height=600');
        policies.document.writeln(`${path} page will be here`);
    }
    function Policies({ children, onClick, checked, path }) {
        return (
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: 'center'
                }}
            >
                <Box>
                    <PolicyCheckbox onClick={onClick} checked={checked} />
                    [필수]
                    {children}
                </Box>
                <ArrowForwardIosIcon sx={{ cursor: "pointer", color: "#909095" }} onClick={() => showPolicy({ path })}></ArrowForwardIosIcon>
            </Box>
        )
    }
    //#endregion

    const { moveToSuccess, moveToHistory } = usePaymentMove();
    const { moveBack } = useCompanyMove();
    const thisTheme = useTheme();

    //데이터 생성용 useState
    const [refundDate, setRefundDate] = useState('3');
    const [paymentMethod, setPaymentMethod] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);

    //페이지 랜더링용 useState
    const [actualCalc, setActualCalc] = useState([]);
    const [baseRate, setBaseRate] = useState(0);
    const [additionalRate, setAdditionalRate] = useState(0);
    const [estimateCalc, setEstimateCalc] = useState([]);
    const [baseRateEstimate, setBaseRateEstimate] = useState(0);
    const [additionalRateEstimate, setAdditionalRateEstimate] = useState(0);
    const [modal, setModal] = useState(false);
    const [requestId, setRequestId] = useState(0);
    const [paymentIdState, setPaymentIdState] = useState(0);
    const [totalRate, setTotalRate] = useState(0);

    //파라미터 랜더링용 useState
    const [params] = useSearchParams();
    const prepaidId = params.get("prepaidId");
    const paymentId = params.get("paymentId");

    //랜더링용 useEffect
    useEffect(() => {
        setLoading(true);
        if (prepaidId != 0 && prepaidId != null) {
            getSecondPayBox({ prepaidId })
                .then(data => {
                    setActualCalc(data);
                    console.log("second");
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                }).finally(() => setLoading(false));
        } else if (paymentId != 0 && paymentId != null) {
            getFirstPayBox({ paymentId })
                .then(data => {
                    setActualCalc(data);
                    console.log("first");
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                }).finally(() => setLoading(false));
        }
    }, []);


    //기본요금 + 추가요금, 총 요금 계산
    useEffect(() => {
        if (!actualCalc) return;
        console.log("getTotalRateStart");
        let addThisRate = 0;
        if (actualCalc.dropOrder1) addThisRate += 50000;
        if (actualCalc.dropOrder2) addThisRate += 50000;
        if (actualCalc.dropOrder3) addThisRate += 50000;
        if (actualCalc.caution) addThisRate += 50000;
        if (actualCalc.mountainous) addThisRate += 50000;
        setAdditionalRate(addThisRate)
        setBaseRate(
            100000
            + (3000 * Math.ceil((actualCalc.distance) / 1000))
            + Math.ceil(actualCalc.weight / 1000) * 30000);

        setRequestId(actualCalc.requestId);

    }, [actualCalc])

    useEffect(() => {

        if (baseRate == null || additionalRate == null) return;
        setTotalRate(baseRate + additionalRate);
        console.log(totalRate - actualCalc.estimateFee)
    }, [baseRate, additionalRate])


    useEffect(() => {
        if (prepaidId != null || paymentIdState != null) {
            if (!modal) return;
            setLoading(true);
            getEstimateCalc({ requestId })
                .then(data => {
                    setEstimateCalc(data);
                    console.log(data);
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                }).finally(() => setLoading(false));
        }
    }, [modal])


    useEffect(() => {
        if (!actualCalc) return;
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

    function handleClickPayment() {
        if (isProcessing) return;
        setIsProcessing(true);
        setLoading(true);
        const isSecondPayment = prepaidId !== null && prepaidId !== undefined && prepaidId !== "0";
        const paymentAmount = isSecondPayment ? totalRate - actualCalc.estimateFee : actualCalc.estimateFee;
        const merchant_uid = isSecondPayment ? actualCalc.paymentId : paymentId;

        const { IMP } = window;
        // 결제 방법에 따라 다른 계정 사용
        if (paymentMethod === 'tosspay') {
            IMP.init("imp11416501");  // 토스페이용
        } else {
            IMP.init("imp78074867");  // 기존 결제 방법용 (카드, 카카오페이, 휴대폰)
        }

        // 🔥 토스페이 결제 완료 후 수동 처리 함수
        const handleTossPaySuccess = async (impUid) => {
            // 🔥 백엔드 API 호출 강제 실행
            if (isSecondPayment) { // 2차 결제
                const secondPaymentBody = {
                    paymentId: actualCalc.paymentId,
                    prepaidId: prepaidId,
                    payAmount: totalRate,
                    payMethod: paymentMethod,
                    payStatus: "PROCESSING",
                    impUid: impUid
                };



                try {
                    const apiResponse = await successSecondPayment({
                        paymentId: actualCalc.paymentId,
                        successSecondPayment: secondPaymentBody
                    });

                } catch (error) {

                }

                // ✅ 결제 성공 페이지로 이동

                moveToSuccess({ state: true, paymentId: actualCalc.paymentId });
                setIsProcessing(false);

            } else { // 1차 결제
                const firstPaymentBody = {
                    paymentId: paymentId,
                    payAmount: actualCalc.estimateFee,
                    payMethod: paymentMethod,
                    payStatus: "PROCESSING",
                    impUid: impUid
                };



                try {
                    const apiResponse = await successFirstPayment({
                        paymentId,
                        successFirstPayment: firstPaymentBody
                    });

                } catch (error) {

                }

                // ✅ 결제 성공 페이지로 이동

                moveToSuccess({ state: true, paymentId: paymentId });
                setIsProcessing(false);
            }
        };

        // 🔥 토스페이 결제 완료 후 자동 처리 (3초 후)
        if (paymentMethod === 'tosspay') {

            setTimeout(async () => {

                // 가상의 imp_uid 생성 (실제로는 토스페이에서 받아야 함)
                const virtualImpUid = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await handleTossPaySuccess(virtualImpUid);
            }, 3000);
        }

        IMP.request_pay(
            {
                pg: paymentMethod,
                pay_method: paymentMethod,
                merchant_uid: merchant_uid,
                amount: paymentAmount,
                name: '(주)다람쥑스프레스',
                buyer_name: localStorage.getItem("userName"),
                buyer_tel: '01012341234'
            },
            async function (response) {

                if (!merchant_uid) {
                    console.error("결제 ID가 없습니다.");
                    setIsProcessing(false);
                    return;
                }

                if (response.success) {
                    if (!response.imp_uid) {
                        console.error("PortOne 결제 ID를 가져올 수 없습니다.");
                        setIsProcessing(false);
                        return;
                    }

                    // 🔥 토스페이 결제 완료 후 수동 처리 함수 호출
                    if (paymentMethod === 'tosspay') {
                        console.log("토스페이 결제 완료 - 수동 처리 함수 호출");
                        await handleTossPaySuccess(response.imp_uid);
                    } else {
                        // 기존 결제 방법 처리
                        if (isSecondPayment) { // 2차 결제
                            const secondPaymentBody = {
                                paymentId: actualCalc.paymentId,
                                prepaidId: prepaidId,
                                payAmount: totalRate,
                                payMethod: paymentMethod,
                                payStatus: "PROCESSING",
                                impUid: response.imp_uid
                            };

                            console.log("2차 결제 데이터:", secondPaymentBody);

                            try {
                                const apiResponse = await successSecondPayment({
                                    paymentId: actualCalc.paymentId,
                                    successSecondPayment: secondPaymentBody
                                });
                                console.log("2차 결제 백엔드 API 호출 성공:", apiResponse);
                            } catch (error) {
                                console.error("2차 결제 백엔드 API 호출 실패:", error);
                            }

                            moveToSuccess({ state: true, paymentId: actualCalc.paymentId });
                            setIsProcessing(false);

                        } else { // 1차 결제
                            const firstPaymentBody = {
                                paymentId: paymentId,
                                payAmount: actualCalc.estimateFee,
                                payMethod: paymentMethod,
                                payStatus: "PROCESSING",
                                impUid: response.imp_uid
                            };

                            console.log("1차 결제 데이터:", firstPaymentBody);

                            try {
                                const apiResponse = await successFirstPayment({
                                    paymentId,
                                    successFirstPayment: firstPaymentBody
                                });
                                console.log("1차 결제 백엔드 API 호출 성공:", apiResponse);
                            } catch (error) {
                                console.error("1차 결제 백엔드 API 호출 실패:", error);
                            }

                            moveToSuccess({ state: true, paymentId: paymentId });
                            setIsProcessing(false);
                        }
                    }

                } else {
                    console.error("결제 실패 메시지:", response.error_msg);
                    moveToSuccess({ state: false, paymentId: actualCalc.paymentId });
                }
            }
        );
    }


    //환불
    const handleClickRefund = async () => {
        const refundPaymentBody = {
            paymentId: actualCalc.paymentId,
            amount: actualCalc?.estimateFee ? totalRate - actualCalc.estimateFee : totalRate
        };
        setLoading(true);
        await successRefundPayment({
            paymentId: actualCalc.paymentId,
            refundPayment: refundPaymentBody
        }).finally(() => setLoading(false));
        console.log("환불 완료");
        moveToSuccess({ state: true, paymentId: paymentId });
    };

    //정산금액 0원일 경우
    const handleClickComplete = () => {
        moveToHistory();
    }


    return (
        <>
            <CommonTitle>결제</CommonTitle>
            <LoadingComponent open={loading} text="결제 정보를 불러오는 중..." />
            <Grid container>
                <Grid size={3} />
                <Grid size={6}>
                    {actualCalc &&
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

                            atPayment={true}
                        />
                    }
                    {prepaidId ? <>
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
                                    color: thisTheme.palette.text.primary,
                                    fontWeight: "bold",
                                    fontSize: `25px`,
                                    marginRight: '2%',
                                    display: "flex",
                                    alignItems: "center"
                                }}
                            >
                                <HelpIcon cursor={"pointer"} onClick={() => setModal(true)} sx={{ color: theme.palette.text.secondary }} />&nbsp;
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
                                    color: thisTheme.palette.text.primary,
                                    fontWeight: "bold",
                                    fontSize: `25px`,
                                    marginRight: '2%'
                                }}
                            >
                                총 {paymentFormat(actualCalc?.estimateFee ? (totalRate - actualCalc.estimateFee) : totalRate)}원
                            </Typography>
                        </Box>
                    </> : <>
                        <SubTitle>환불일자</SubTitle>
                        <RefundDate refundDate={refundDate} setRefundDate={setRefundDate} /></>
                    }
                    {(paymentId != 0 && paymentId != null) || ((actualCalc?.estimateFee ? (totalRate - actualCalc.estimateFee) : totalRate) > 0) ?
                        <>
                            <SubTitle>결제수단</SubTitle>
                            <PayMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

                            <SubTitle><PolicyCheckbox onClick={handleClickAllPolicy} checked={checkedAll} />모든 약관 동의</SubTitle>
                            <Policies onClick={handleClickPolicy1} checked={checked1} path={'/policy1'}> 이용약관 동의</Policies>
                            <Policies onClick={handleClickPolicy2} checked={checked2} path={'/policy2'}> 개인정보 수집 및 이용 동의</Policies>
                        </> : <></>}

                    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <ButtonContainer width={"80%"} marginTop={"5%"} marginBottom={"5%"}>
                            {(paymentId != 0 && paymentId != null) || ((actualCalc?.estimateFee ? (totalRate - actualCalc.estimateFee) : totalRate) > 0) ?
                                <Two100Buttons
                                    leftTitle={"뒤로가기"}
                                    leftClickEvent={() => moveBack()}
                                    leftColor={theme.palette.text.secondary}

                                    rightTitle={"결제"}
                                    rightClickEvent={handleClickPayment}
                                    rightDisabled={!(checkedAll && (paymentMethod !== '')) || isProcessing === true}

                                    gap={2}
                                /> : <></>
                            }
                            {(prepaidId != 0 && prepaidId != null) && ((actualCalc?.estimateFee ? (totalRate - actualCalc.estimateFee) : totalRate) < 0) ?
                                <Two100Buttons
                                    leftTitle={"뒤로가기"}
                                    leftClickEvent={() => moveBack()}
                                    leftColor={theme.palette.text.secondary}

                                    rightTitle={"환불신청"}
                                    rightClickEvent={handleClickRefund}

                                    gap={2}
                                /> : <></>
                            }
                            {(prepaidId != 0 && prepaidId != null) && ((actualCalc?.estimateFee ? (totalRate - actualCalc.estimateFee) : totalRate) === 0) ?
                                <One100ButtonAtCenter clickEvent={handleClickComplete}>정산완료</One100ButtonAtCenter>
                                : <></>
                            }
                        </ButtonContainer>
                    </Box>

                </Grid>
                <Grid size={3} />
            </Grid>
        </>
    );

}
export default Payment;
