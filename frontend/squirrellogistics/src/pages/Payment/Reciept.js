import { Box, Button } from "@mui/material"
import { BGBox } from "./Payment"
import { useReactToPrint } from "react-to-print"
import React, { useRef } from "react"

export const Reciept = () => {
    const RecieptBox = ({ children, title }) => {
        return (
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    paddingBottom: "15px",
                    borderBottom: "1px solid #909095"
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        fontSize: "18px",
                        marginTop: "20px",
                        marginBottom: "10px"
                    }}
                >
                    {title}
                </Box>
                {children}
            </Box>
        )
    }

    const ReceiptContents = ({ title, content }) => {
        return (
            <Box
                sx={{
                    width: "90%",
                    fontWeight: "normal",
                    fontSize: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <Box>{title}</Box>
                <Box>{content}</Box>
            </Box>
        );
    }

    const printBtnRef = useRef();
    const handlePrint = () => {
        printBtnRef.current.style.display = "none";
        window.print();
        printBtnRef.current.style.display = "block";
    }

    return (
        <BGBox>
            <Box
                sx={{
                    width: "100%",
                    fontWeight: "bold",
                    fontSize: "25px",
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}
            >영 수 증
                <RecieptBox title={"결제정보"}>
                    <ReceiptContents title={"카드종류"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"거래종류"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"할부개월"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"카드번호"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"거래일시"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"승인번호"} content={"ㅇㅇㅇ"} />
                </RecieptBox>
                <RecieptBox title={"구매정보"}>
                    <ReceiptContents title={"주문번호"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"상 품 명"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"과세금액"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"비과세금액"} content={"0원"} />
                    <ReceiptContents title={"부가세"} content={"ㅇㅇㅇ"} />
                    <ReceiptContents title={"합계금액"} content={"ㅇㅇㅇ"} />
                </RecieptBox>
                <RecieptBox title={"업체정보"}>
                    <ReceiptContents title={"상호"} content={"(주)다람쥑스프레스"} />
                    <ReceiptContents title={"사업자등록번호"} content={"012-34-56789"} />
                    <ReceiptContents title={"주소"} content={"깊은 산 속"} />
                </RecieptBox>
            </Box>
            <Box
                sx={{
                    fontSize: "14px",
                    color: "#909095",
                    margin: "30px 0"
                }}
            >
                위 신용카드 매출전표는 부가가치세법 제32조의 2 제3항에 의거하여 발행되었으며, 동법시행령 제 57조 제 2항에 의거하여 세금계산서를 교부하지 않습니다.
                단, 기프트카드 구매 내역에 대해서는 소득공제가 적용되지 않습니다.<br /><br />
                카드사 측 정책 상, BC/국민카드 결제 건의 경우 가상 카드번호로 보여질 수 있습니다. 실 카드번호의 내역이 필요하다면
                해당 카드사로 문의 부탁드립니다.
            </Box>
            <Button
                variant="contained"
                sx={{
                    width: "100%",
                    fontSize: "20px",
                    fontWeight: "bold"
                }}
                onClick={handlePrint}
                ref={printBtnRef}
            >
                프 린 트
            </Button>
        </BGBox>
    )
}
export default Reciept;