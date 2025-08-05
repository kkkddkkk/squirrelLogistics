import { Box, Button, Checkbox, Typography } from "@mui/material";
import PayBox from "../../components/payment/payBox";
import { RefundDate } from "../../components/payment/RefundDate";
import { PayMethod } from "../../components/payment/PayMethod";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState } from "react";

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
                fontSize: '24px',
                color: '#2A2A2A',
                width: '100%',
            }}
        >
            {children}
        </Typography>
    )
}

export const Payment = () => {

    function BGBox({ children }) {
        return (
            <Box
                bgcolor={"#F5F7FA"}
                display="flex"
                justifyContent="center"
                width={"100%"}
                height={"100vh"}
                marginBottom={"2%"}
                flexWrap={"wrap"}
            >
                {children}
            </Box>
        )
    }

    let clickedCount = 0;
    const [checkedAll, setCheckedAll] = useState(false);
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);

    //#region [handleClickPolicy]
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

    function PolicyCheckbox({ onClick, checked }) {
        const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
        return (
            <Checkbox{...label} onClick={onClick} checked={checked} />
        )
    }

    function showPolicy() {

    }

    function Policies({ children, onClick, checked }) {
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
                <ArrowForwardIosIcon sx={{ cursor: "pointer", color: "#909095" }} onClick={showPolicy}></ArrowForwardIosIcon>
            </Box>
        )
    }
    function handliClickPayment() {
        const { IMP } = window;
        IMP.init("imp78074867");
        IMP.request_pay(
            {
                pg: 'html5_inicis',                           // PG사
                pay_method: 'card',                           // 결제수단
                merchant_uid: `mid_${new Date().getTime()}`,   // 주문번호
                amount: 1000,                                 // 결제금액
                name: '아임포트 결제 데이터 분석',                  // 주문명
                buyer_name: '홍길동',                           // 구매자 이름
                buyer_tel: '01012341234',                     // 구매자 전화번호
                buyer_email: 'example@example',               // 구매자 이메일
                buyer_addr: '신사동 661-16',                    // 구매자 주소
                buyer_postcode: '06018',                      // 구매자 우편번호
            },
            function (response) {
                // 결제 종료 시 호출되는 콜백 함수
                // response.imp_uid 값으로 결제 단건조회 API를 호출하여 결제 결과를 확인하고,
                // 결제 결과를 처리하는 로직을 작성합니다.
            },
        );
    }


    return (
        <BGBox>
            <Box width={"60%"} maxWidth={"700px"}>
                <TitleForCharge>결제</TitleForCharge>
                <SubTitleForCharge>결제금액</SubTitleForCharge>
                <PayBox />

                <SubTitleForCharge>환불일자</SubTitleForCharge>
                <RefundDate />

                <SubTitleForCharge>결제수단</SubTitleForCharge>
                <PayMethod />

                <SubTitleForCharge><PolicyCheckbox onClick={handleClickAllPolicy} checked={checkedAll} />모든 약관 동의</SubTitleForCharge>
                <Policies onClick={handleClickPolicy1} checked={checked1}> 이용약관 동의</Policies>
                <Policies onClick={handleClickPolicy2} checked={checked2}> 개인정보 수집 및 이용 동의</Policies>

                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <Button
                        variant="contained"
                        sx={{
                            width: "60%",
                            height: "50px",
                            margin: "5%",
                            fontSize: "25px"
                        }}
                        onClick={handliClickPayment}
                    >
                        결&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;제
                    </Button>
                </Box>

            </Box>
        </BGBox>
    );
}

/* <Button> testButton </Button>
<TextField>testTextField</TextField>
<Checkbox ></Checkbox>testCheckbos
<Radio></Radio>testRadio
<Switch></Switch>testSwitch
<Dialog></Dialog>testDialog
<Toolbar>testToolbar</Toolbar>
<Card>testCard</Card>
<Paper>testPaper</Paper>
<Grid>testGrid</Grid>
<Box>test</Box>*/