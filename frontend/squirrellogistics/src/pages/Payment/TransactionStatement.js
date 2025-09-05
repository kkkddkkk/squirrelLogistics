import { Box, Button, FormControl, lighten, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import { Buttons } from "../../components/history/HistoryList";
import { getTransactionStatement } from "../../api/company/paymentApi";
import { useSearchParams } from "react-router-dom";
import { paymentFormat } from "../../components/common/CommonForCompany";
import LoadingComponent from "../../components/common/LoadingComponent";
import { theme } from "../../components/common/CommonTheme";

const TransactionStatement = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentId = searchParams.get?.("paymentId");

    const [trans, setTrans] = useState();

    useEffect(() => {
        if (!paymentId) return;
        getTransactionStatement({ paymentId })
            .then(data => {
                setTrans(data);
            })
            .catch(err => {
                // console.error("데이터 가져오기 실패", err);
            });

    }, [paymentId]);

    const StateInput = ({ children, name }) => {
        return (
            <TextField
                sx={{
                    "& input": {
                        color: theme.palette.text.primary, // 입력 글자 색
                        "&:-webkit-autofill": {
                            WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.default} inset !important`,
                            WebkitTextFillColor: theme.palette.text.primary,
                        },
                    },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "transparent", // 테두리 없애기
                        },
                        "&:hover fieldset": {
                            borderColor: "transparent", // 호버 시 테두리
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "transparent", // 포커스 시 테두리
                        },
                    },
                    "& input::placeholder": {
                        color: lighten(theme.palette.text.primary, 0.5), // 플레이스홀더 색
                    },

                }}
                placeholder="입력가능"
                name={name}
            >
                {children}
            </TextField>
        )
    }

    const StatementButton = ({ children, func, ref }) => {
        return (
            <Button
                variant="contained"
                sx={{ width: "40%", fontSize: "20px", height: "35px" }}
                onClick={func}
                ref={ref}
            >
                {children}
            </Button>
        )
    }

    const printBtnRef = useRef();
    const xlsxBtnRef = useRef();
    const handlePrint = () => {
        printBtnRef.current.style.display = "none";
        xlsxBtnRef.current.style.display = "none";
        window.print();
        printBtnRef.current.style.display = "block";
        xlsxBtnRef.current.style.display = "block";
    }


    const tableRef = useRef(null);

    return (
        <Box sx={{
            width: "100%", display: "flex", justifyContent: "center",
            flexWrap: "wrap", backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary
        }}>
            <LoadingComponent open={!trans} text="거래명세표를 불러오는 중..." />
            <FormControl>
                <TableContainer sx={{ width: "100%", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                    <Table ref={tableRef} sx={{
                        width: "90%", padding: 0, "& .MuiTableCell-root": {
                            padding: "5px",
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary
                        },
                        margin: "25px"
                    }} >
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ fontSize: "20px", fontWeight: "bold" }}>거 래 명 세 표</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell rowSpan={4} width={"10%"} padding="0" align="center">발행인</TableCell>
                                <TableCell width={"5%"} align="center">사업자<br />등록번호</TableCell>
                                <TableCell colSpan={3} width={"30%"}>012-34-56789</TableCell>
                                <TableCell rowSpan={4} width={"5%"} align="center">공급받는자</TableCell>
                                <TableCell width={"5%"} align="center">사업자<br />등록번호</TableCell>
                                <TableCell colSpan={3} width={"35%"} ><StateInput /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell width={"10%"} align="center">상호<br />(법인명)</TableCell>
                                <TableCell width={"15%"}>다람쥑스프레스</TableCell>
                                <TableCell width={"5%"} align="center">성명</TableCell>
                                <TableCell width={"10%"}>GPT</TableCell>

                                <TableCell width={"10%"} align="center">상호<br />(법인명)</TableCell>
                                <TableCell><StateInput name={"companyName"} /></TableCell>
                                <TableCell width={"5%"} align="center">성명</TableCell>
                                <TableCell ><StateInput name={"bossName"} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">사업장<br />주소</TableCell>
                                <TableCell colSpan={3}>깊은 산 속</TableCell>

                                <TableCell align="center">사업장<br />주소</TableCell>
                                <TableCell colSpan={3}><StateInput name={"address"} /></TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell align="center">업태</TableCell>
                                <TableCell>000</TableCell>
                                <TableCell align="center">종목</TableCell>
                                <TableCell >000</TableCell>

                                <TableCell align="center">업태</TableCell>
                                <TableCell><StateInput name={"businessType"} /></TableCell>
                                <TableCell align="center">종목</TableCell>
                                <TableCell ><StateInput name={"service"} /></TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell align="center">거래일시</TableCell>
                                <TableCell colSpan={6} align="center" width={"60%"}>상품명</TableCell>
                                <TableCell width={"10%"} align="center">수량</TableCell>
                                <TableCell width={"10%"} align="center">거래액<br />(VAT 포함)</TableCell>
                                <TableCell width={"10%"} align="center"> 비고</TableCell>
                            </TableRow>

                            {/* 이곳에 결제데이터 삽입! */}
                            {trans?.prepaidId ? <>

                                {trans?.prepaidAmount ?
                                    <TableRow>
                                        <TableCell align="center">{trans.prepaidPaid?.slice(0, 10)}</TableCell>
                                        <TableCell colSpan={6} align="center">다람쥑스프레스 사전결제</TableCell>
                                        <TableCell align="center">1</TableCell>
                                        <TableCell align="center">{paymentFormat(trans.prepaidAmount)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow> : <></>
                                }

                                {trans?.amount ?
                                    <TableRow>
                                        <TableCell align="center">{trans.paid?.slice(0, 10)}</TableCell>
                                        <TableCell colSpan={6} align="center">다람쥑스프레스 사후결제</TableCell>
                                        <TableCell align="center">1</TableCell>
                                        <TableCell align="center">{paymentFormat(trans.amount)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow> : <></>
                                }

                            </> : <></>}

                            <TableRow>
                                <TableCell colSpan={7} align="center">총 거래액 합계</TableCell>
                                <TableCell></TableCell>
                                <TableCell align="center">{trans ? paymentFormat(trans.amount + trans.prepaidAmount) : 0}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell colSpan={7} align="center">할인금액</TableCell>
                                <TableCell></TableCell>
                                <TableCell align="center">0</TableCell>
                                <TableCell></TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell colSpan={7} align="center" >총 결제금액</TableCell>
                                <TableCell width={"10%"}></TableCell>
                                <TableCell width={"10%"} align="center">{trans ? paymentFormat(trans.amount + trans.prepaidAmount) : 0}</TableCell>
                                <TableCell width={"10%"}></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </FormControl>
            <Box sx={{ width: "40%", display: "flex", justifyContent: "space-around", marginBottom: "25px" }}>
                <StatementButton ref={xlsxBtnRef}>내보내기</StatementButton>
                <StatementButton func={handlePrint} ref={printBtnRef}>인 쇄</StatementButton>
            </Box>
        </Box>
    )
}

export default TransactionStatement;