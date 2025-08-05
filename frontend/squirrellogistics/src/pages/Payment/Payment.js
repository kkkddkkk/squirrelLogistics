import { Box, Button, Checkbox, Typography } from "@mui/material";
import PayBox from "../../components/payment/payBox";
import { RefundDate } from "../../components/payment/RefundDate";
import { PayMethod } from "../../components/payment/PayMethod";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState } from "react";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";



export function SubTitleForCharge({ children }) {
    return (
        <Typography
            variant="h6"
            color="#2A2A2A"
            width={"100%"}
            padding={"2%"}
        >
            {children}
        </Typography>
    )
}

export function TitleForCharge({ children }) {
    return (
        <Typography
            variant="subtitle1"
            display={"block"}
            sx={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2A2A2A',
                width: '100%',
                margin: '3%'
            }}
        >
            {children}
        </Typography>
    )
}

export const Payment = () => {
    //#region [handleClickPolicy]
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
    //#endregion

    const { moveToSuccess } = usePaymentMove();
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

    const [refundDate, setRefundDate] = useState('3');
    const [merchant_uid, setMerchant_uid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState("");

    function handleClickPayment() {
        const uid = `mid_${new Date().getTime()}`;
        setMerchant_uid(uid);

        const { IMP } = window;
        IMP.init("imp78074867");
        IMP.request_pay(
            {
                pg: paymentMethod,                           // PG사
                pay_method: paymentMethod,                           // 결제수단
                merchant_uid: uid,   // 주문번호
                amount: 1,                                 // 결제금액
                name: '(주)다람쥑스프레스',                  // 주문명
                buyer_name: '홍길동',                           // 구매자 이름
                buyer_tel: '01012341234',                     // 구매자 전화번호
                buyer_email: 'example@example',               // 구매자 이메일
                buyer_addr: '신사동 661-16',                    // 구매자 주소
                buyer_postcode: '06018',                      // 구매자 우편번호
            },
            function (response) {
                moveToSuccess(response.success);
            },
        );
    }


    return (
        <>
            <SubTitleForCharge>결제금액</SubTitleForCharge>
            <PayBox />

            <SubTitleForCharge>환불일자</SubTitleForCharge>
            <RefundDate refundDate={refundDate} setRefundDate={setRefundDate} />

            <SubTitleForCharge>결제수단</SubTitleForCharge>
            <PayMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

            <SubTitleForCharge><PolicyCheckbox onClick={handleClickAllPolicy} checked={checkedAll} />모든 약관 동의</SubTitleForCharge>
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
        </>

    );
}

export default Payment;
