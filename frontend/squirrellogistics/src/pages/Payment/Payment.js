import { Box, Button, Checkbox, Grid, Modal, Typography } from "@mui/material";
import PayBox from "../../components/payment/payBox";
import { RefundDate } from "../../components/payment/RefundDate";
import { PayMethod } from "../../components/payment/PayMethod";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useEffect, useState } from "react";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { Layout, paymentFormat, SubTitle, Title } from "../../components/common/CommonForCompany";
import { cancelPayment, getFirstPayBox, getSecondPayBox, refund, requestRefund, successFirstPayment, successSecondPayment } from "../../api/company/paymentApi";
import { useSearchParams } from "react-router-dom";
import RemoveIcon from '@mui/icons-material/Remove';
import HelpIcon from '@mui/icons-material/Help';
import { getEstimateCalc } from "../../api/company/actualCalcApi";
import axios from "axios";
import useCompanyMove from "../../hook/company/useCompanyMove";
import { PaymentClient } from "@portone/server-sdk";



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

    const { moveToSuccess } = usePaymentMove();
    const { moveBack } = useCompanyMove();

    //데이터 생성용 useState
    const [refundDate, setRefundDate] = useState('3');
    const [merchant_uid, setMerchant_uid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState("");

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
        if (prepaidId != 0 && prepaidId != null) {
            getSecondPayBox({ prepaidId })
                .then(data => {
                    setActualCalc(data);
                    console.log("second");
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                });
        } else if (paymentId != 0 && paymentId != null) {
            getFirstPayBox({ paymentId })
                .then(data => {
                    setActualCalc(data);
                    console.log("first");
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                });
        }
    }, []);


    //기본요금 + 추가요금, 총 요금 계산
    useEffect(() => {
        if (!actualCalc) return;
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
        if (!baseRate || !additionalRate) return;
        setTotalRate(baseRate + additionalRate);
    }, [baseRate, additionalRate])


    useEffect(() => {
        if (prepaidId != null || paymentIdState != null) {
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
        if (!actualCalc) return;
        let additionalFee;
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

        const merchant_uid = prepaidId ? actualCalc.paymentId : paymentId;
        const { IMP } = window;
        IMP.init("imp78074867");

        IMP.request_pay(
            {
                pg: paymentMethod,
                pay_method: paymentMethod,
                merchant_uid: merchant_uid,
                amount: totalRate || 0,
                name: '(주)다람쥑스프레스',
                buyer_name: localStorage.getItem("userName"),
                buyer_tel: '01012341234'
            },
            async function (response) {

                if (!merchant_uid) {
                    console.error("결제 ID가 없습니다.");
                    return;
                }
                if (response.success) {
                    if (prepaidId) { // 2차 결제
                        const secondPaymentBody = {
                            paymentId: actualCalc.paymentId,
                            prepaidId: prepaidId,
                            payAmount: totalRate,
                            payMethod: paymentMethod,
                            payStatus: "PROCESSING",
                            impUid: response.imp_uid
                        };
                        await successSecondPayment({ paymentId: actualCalc.paymentId, successSecondPayment: secondPaymentBody });
                        moveToSuccess({ state: true, paymentId: actualCalc.paymentId });
                    } else { // 1차 결제
                        const firstPaymentBody = {
                            paymentId: paymentId,
                            payAmount: totalRate,
                            payMethod: paymentMethod,
                            payStatus: "PROCESSING",
                            impUid: response.paymentId
                        };
                        await successFirstPayment({ paymentId, successFirstPayment: firstPaymentBody });
                        moveToSuccess({ state: true, paymentId: actualCalc.paymentId });
                    }
                } else {
                    console.error("결제 실패 메시지:", response.error_msg);
                    moveToSuccess({ state: false, paymentId: actualCalc.paymentId });
                }

            }
        );

    }

    //     paymentId: prepaidId, // getPaymentByImpUid 결과 사용
    // reason: "고객 요청",
    // currentCancellableAmount: 1000000000,
    // amount: actualCalc?.estimateFee
    //     ? totalRate - actualCalc.estimateFee
    //     : totalRate, // 반드시 양수


    // async function cancelPayment() {
    //     if (!actualCalc?.impUid) {
    //         alert("환불할 결제 정보가 없습니다.");
    //         return;
    //     }

    //     const refundDTO = {
    //         impUid: actualCalc.impUid,
    //         amount: actualCalc.estimateFee ? totalRate - actualCalc.estimateFee : totalRate,
    //         reason: "고객 요청",
    //     };

    //     try {
    //         const result = await requestRefund(refundDTO);
    //         console.log("환불 성공:", result);
    //         alert("환불이 완료되었습니다.");
    //     } catch (err) {
    //         alert("환불 중 오류가 발생했습니다: " + err.message);
    //     }
    // }

    const handleClickRefund = async () => {
        try {
            const result = await cancelPayment(actualCalc.impUid, "고객 요청");
            console.log("환불 결과:", result);
            alert("환불이 완료되었습니다!");
        } catch (err) {
            console.error("환불 실패:", err);
            alert("환불 실패: " + err.message);
        }
    };


    return (
        <Layout title={"결제"}>
            <Grid size={12} display={"flex"} justifyContent={"center"}>
                <Box width={"90%"} minWidth={"600px"}>

                    <SubTitle>결제금액</SubTitle>
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
                                    color: "#2A2A2A",
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
                        <Button
                            variant="contained"
                            sx={{ width: "40%", height: "50px", margin: "5%", fontSize: "25px" }}
                            onClick={() => moveBack()}
                        >
                            뒤로가기
                        </Button>
                        {(paymentId != 0 && paymentId != null) || ((actualCalc?.estimateFee ? (totalRate - actualCalc.estimateFee) : totalRate) > 0) ?
                            <Button
                                variant="contained"
                                sx={{ width: "40%", height: "50px", margin: "5%", fontSize: "25px" }}
                                onClick={handleClickPayment}
                                disabled={!(checkedAll && (paymentMethod !== ''))}
                            >
                                결&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;제
                            </Button> : <></>
                        }
                        {(prepaidId != 0 && prepaidId != null) && ((actualCalc?.estimateFee ? (totalRate - actualCalc.estimateFee) : totalRate) < 0) ?
                            <Button
                                variant="contained"
                                sx={{ width: "40%", height: "50px", margin: "5%", fontSize: "25px" }}
                                onClick={handleClickRefund}
                            >
                                환불신청
                            </Button> : <></>
                        }
                    </Box>

                </Box>
            </Grid>
        </Layout>



    );

}
export default Payment;
