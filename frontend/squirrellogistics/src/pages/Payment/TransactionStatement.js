import { Box, Button, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import { useRef } from "react";
import { Buttons } from "../../components/history/HistoryList";

const TransactionStatement = () => {
    const StateInput = ({ children, name }) => {
        return (
            <TextField
                sx={{
                    "& fieldset": { border: "none" }
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
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
            <FormControl>
                <TableContainer sx={{ width: "100%", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                    <Table ref={tableRef} sx={{
                        width: "90%", padding: 0, "& .MuiTableCell-root": { padding: "5px" },
                        margin: "25px"
                    }} >
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ fontSize: "20px", fontWeight: "bold" }}>거 래 명 세 표</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell rowSpan={4} width={"5%"} padding="0" align="center">발행인</TableCell>
                                <TableCell width={"5%"} align="center">사업자<br />등록번호</TableCell>
                                <TableCell colSpan={3} width={"35%"}>012-34-56789</TableCell>
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

                            <TableRow>
                                <TableCell align="center">0000.00.00</TableCell>
                                <TableCell colSpan={6} align="center">oooooooooo</TableCell>
                                <TableCell align="center">00</TableCell>
                                <TableCell align="center">000,000</TableCell>
                                <TableCell></TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell colSpan={7} align="center">총 거래액 합계</TableCell>
                                <TableCell></TableCell>
                                <TableCell align="center">000,000</TableCell>
                                <TableCell></TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell colSpan={7} align="center">할인금액</TableCell>
                                <TableCell></TableCell>
                                <TableCell align="center">000,000</TableCell>
                                <TableCell></TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell colSpan={7} align="center" >총 결제금액</TableCell>
                                <TableCell width={"10%"}></TableCell>
                                <TableCell width={"10%"} align="center">000,000</TableCell>
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