import { Box, Button, Checkbox, Grid, Modal, Typography } from "@mui/material";
import PayBox from "../../components/payment/payBox";
import { RefundDate } from "../../components/payment/RefundDate";
import { PayMethod } from "../../components/payment/PayMethod";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useEffect, useState } from "react";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { Layout, paymentFormat, SubTitle, Title } from "../../components/common/CommonForCompany";
import { getSecondPayBox, ModifySecondPayment } from "../../api/company/paymentApi";
import { useSearchParams } from "react-router-dom";
import ActualCalc from "../ActualCalc/ActualCalc";
import RemoveIcon from '@mui/icons-material/Remove';
import { Buttons } from "../../components/history/HistoryList";
import HelpIcon from '@mui/icons-material/Help';
import { getEstimateCalc } from "../../api/company/actualCalcApi";


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

    //데이터 생성용 useState
    const [refundDate, setRefundDate] = useState('3');
    const [merchant_uid, setMerchant_uid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState("");

    //페이지 랜더링용 useState
    const [actualCalc, setActualCalc] = useState([]);
    const [baseRate, setBaseRate] = useState(0);
    const [additionalRate, setAdditionalRate] = useState(0);
    const [estimateCalc, setEstimateCalc] = useState(null);
    const [baseRateEstimate, setBaseRateEstimate] = useState(null);
    const [additionalRateEstimate, setAdditionalRateEstimate] = useState(null);
    const [modal, setModal] = useState(false);
    const [requestId, setRequestId] = useState(null);
    const [paymentIdState, setPaymentIdState] = useState(0);
    const [totalRate, setTotalRate] = useState(0);

    //파라미터 랜더링용 useState
    const [params] = useSearchParams();
    const prepaidId = params.get("prepaidId");
    const paymentId = params.get("paymentId");

    //DTO 생성용 useState
    const [secondPayment, setSecondPayment] = useState({
        paymentId: '',
        prepaidId: prepaidId,
        payAmount: '',
        payMethod: '',
        payStatus: 'PENDING',
    })

    //랜더링용 useEffect
    useEffect(() => {
        if (prepaidId != 0 && prepaidId != null) {
            getSecondPayBox({ prepaidId })
                .then(data => {
                    setActualCalc(data);
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                });
        }
    }, []);

    //기본요금 + 추가요금, 총 요금 계산
    useEffect(() => {
        if (!actualCalc) return;
        setBaseRate(100000 + (actualCalc.distance / 1000) * 3000 + Math.ceil((actualCalc.weight / 1000)) * 30000);
        let addThisRate = 0;
        if (actualCalc.dropOrder1) addThisRate += 50000;
        if (actualCalc.dropOrder2) addThisRate += 50000;
        if (actualCalc.dropOrder3) addThisRate += 50000;
        if (actualCalc.mountainous) addThisRate += 50000;
        if (actualCalc.caution) addThisRate += 50000;
        setAdditionalRate(addThisRate);

        setRequestId(actualCalc.requestId);
        setPaymentIdState(actualCalc.paymentId);
    }, [actualCalc])
    useEffect(() => {
        setTotalRate((baseRate + additionalRate) - actualCalc.estimateFee);
    }, [additionalRate])

    //모달 클릭 시 예상금액 계산서 출력
    useEffect(() => {
        if (prepaidId != null || paymentIdState != null) {
            if (!modal) return;
            getEstimateCalc({ requestId })
                .then(data => {
                    setEstimateCalc(data);
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                });
        }
    }, [modal])
    useEffect(() => {
        if (!estimateCalc) return;
        setAdditionalRateEstimate((estimateCalc.dropOrderNum ?? 0) * 50000);
        setBaseRateEstimate(
            100000 + (3000 * ((estimateCalc.distance ?? 0) / 1000))
            + (Math.ceil((estimateCalc.weight ?? 0) / 1000)) * 30000
        );
    }, [estimateCalc]);

    //결제 function
    function handleClickPayment() {
        setMerchant_uid(actualCalc?.paymentId);

        const { IMP } = window;
        IMP.init("imp78074867");
        IMP.request_pay(
            {
                pg: paymentMethod,// PG사
                pay_method: paymentMethod,// 결제수단
                merchant_uid: merchant_uid,// 주문번호
                amount: prepaidId ? totalRate : 0,// 결제금액
                name: '(주)다람쥑스프레스',// 주문명
                buyer_name: '홍길동',// 구매자 이름
                buyer_tel: '01012341234'// 구매자 전화번호 
            },
            function (response) {
                if (prepaidId != 0 && prepaidId != null) {
                    let paymentId = actualCalc.paymentId;

                    const trySecondPayment = {
                        ...secondPayment,
                        paymentId: paymentId,
                        payMethod: paymentMethod,
                        payAmount: prepaidId ? totalRate : 0,
                    };

                    if (response.success) {
                        ModifySecondPayment({ paymentId, secondPayment: trySecondPayment })
                            .then(data => {
                                console.log(data);
                                moveToSuccess({ state: true, paymentId });
                            })
                            .catch(err => {
                                console.error("수정 실패", err);
                            });
                    } else {
                        ModifySecondPayment({ paymentId, secondPayment: trySecondPayment })
                            .then(data => {
                                console.log(data);
                                moveToSuccess({ state: false, paymentId });
                                console.error("결제 실패 메시지:", response.error_msg);
                            })
                            .catch(err => {
                                console.error("수정 실패", err);
                            });
                    }
                }

            },
        );
    }

    return (
        <Layout title={"결제"}>
            <Grid size={12} display={"flex"} justifyContent={"center"}>
                <Box width={"90%"} minWidth={"600px"}>
                    <SubTitle>결제금액</SubTitle>
                    <PayBox
                        mileage={actualCalc.distance / 1000}
                        weight={actualCalc.weight}
                        baseRate={baseRate}
                        stopOver1={actualCalc?.dropOrder1 ? true : false}
                        stopOver2={actualCalc?.dropOrder2 ? true : false}
                        stopOver3={actualCalc?.dropOrder3 ? true : false}
                        caution={actualCalc?.caution ? true : false}
                        mountainous={actualCalc?.mountainous ? true : false}
                        additionalRate={additionalRate}
                    />

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
                                                    mileage={estimateCalc.distance / 1000}
                                                    weight={estimateCalc.weight}
                                                    baseRate={baseRateEstimate}
                                                    stopOver1={!!estimateCalc.dropOrderNum}
                                                    stopOver2={estimateCalc.dropOrderNum === 2}
                                                    stopOver3={estimateCalc.dropOrderNum === 3}
                                                    caution={estimateCalc.handlingId === 11 || estimateCalc.handlingId === 13}
                                                    mountainous={estimateCalc.handlingId === 12 || estimateCalc.handlingId === 13}
                                                    additionalRate={estimateCalc.dropOrderNum * 50000}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </Modal>
                                {paymentFormat(actualCalc ? actualCalc.estimateFee : 0)}원
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
                                총 {paymentFormat(actualCalc ? totalRate : 0)}원
                            </Typography>
                        </Box>
                    </> : <>
                        <SubTitle>환불일자</SubTitle>
                        <RefundDate refundDate={refundDate} setRefundDate={setRefundDate} /></>
                    }

                    <SubTitle>결제수단</SubTitle>
                    <PayMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

                    <SubTitle><PolicyCheckbox onClick={handleClickAllPolicy} checked={checkedAll} />모든 약관 동의</SubTitle>
                    <Policies onClick={handleClickPolicy1} checked={checked1} path={'/policy1'}> 이용약관 동의</Policies>
                    <Policies onClick={handleClickPolicy2} checked={checked2} path={'/policy2'}> 개인정보 수집 및 이용 동의</Policies>

                    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <Button
                            variant="contained"
                            sx={{ width: "60%", height: "50px", margin: "5%", fontSize: "25px" }}
                            onClick={handleClickPayment}
                            disabled={!(checkedAll && (paymentMethod !== ''))}
                        >
                            결&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;제
                        </Button>
                    </Box>
                </Box>
            </Grid>
        </Layout>



    );
}

export default Payment;
