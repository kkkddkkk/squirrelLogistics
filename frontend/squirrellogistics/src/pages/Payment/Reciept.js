import { Box, Button, Grid } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import { Layout, paymentFormat } from "../../components/common/CommonForCompany"
import { useSearchParams } from "react-router-dom";
import { getReciept } from "../../api/company/paymentApi";
import LoadingComponent from "../../components/common/LoadingComponent";

export const Reciept = () => {
    const [params] = useSearchParams();
    const paymentId = params.get("paymentId");
    const [reciept, setReciept] = useState([]);
    const [method, setMethod] = useState(null);
    const [prepaidMethod, setPrepaidMethod] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (paymentId != 0 && paymentId != null) {
            setLoading(true);
            getReciept({ paymentId })
                .then(data => {
                    setReciept(data);
                })
                .catch(err => {
                    console.error("데이터 가져오기 실패", err);
                })
                .finally(() => setLoading(false));
        }
    }, []);


    useEffect(() => {
        if (!reciept) return;
        switch (reciept.method) {
            case 'html5_inicis':
                setMethod("신용카드 결제");
                break;
            case 'kakaopay':
                setMethod("카카오페이");
                break;
            case 'danal':
                setMethod("휴대폰 소액결제");
                break;
            default:
                setMethod("토스페이");
        }

        switch (reciept.prepaidMethod) {
            case 'html5_inicis':
                setPrepaidMethod("신용카드 결제");
                break;
            case 'kakaopay':
                setPrepaidMethod("카카오페이");
                break;
            case 'danal':
                setPrepaidMethod("휴대폰 소액결제");
                break;
            default:
                setPrepaidMethod("토스페이");
        }
    }, [reciept])

    const RecieptBox = ({ children, title }) => {
        return (
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}
            >
                <Box
                    sx={{
                        width: "90%",
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

    const TermBox = () => {
        return (
            <Box
                sx={{
                    fontSize: "14px",
                    color: "#909095",
                    margin: "30px 0",
                    width: "90%"
                }}
            >
                위 신용카드 매출전표는 부가가치세법 제32조의 2 제3항에 의거하여 발행되었으며, 동법시행령 제 57조 제 2항에 의거하여 세금계산서를 교부하지 않습니다.
                단, 기프트카드 구매 내역에 대해서는 소득공제가 적용되지 않습니다.<br /><br />
                카드사 측 정책 상, BC/국민카드 결제 건의 경우 가상 카드번호로 보여질 수 있습니다. 실 카드번호의 내역이 필요하다면
                해당 카드사로 문의 부탁드립니다.
            </Box>
        )
    }

    const printBtnRef = useRef();
    const blankRef = useRef();
    const handlePrint = () => {
        printBtnRef.current.style.display = "none";
        blankRef.current.style.display = "block";
        window.print();
        printBtnRef.current.style.display = "block";
        blankRef.current.style.display = "none";
    }

    return (
        <Layout>
            <Box width={"100%"} display={"flex"} justifyContent={"center"}>
                <Box sx={{
                    width: "90%", display: "flex",
                    justifyContent: "center", flexWrap: "wrap",
                    maxWidth: "500px", minWidth: "400px",
                    margin: "30px 0"
                }}>
                    {reciept ? <>
                        {reciept.prepaidPaid ? <>
                            <Box
                                sx={{
                                    width: "90%",
                                    fontWeight: "bold",
                                    fontSize: "25px",
                                    display: "flex",
                                    justifyContent: "center",
                                    flexWrap: "wrap"
                                }}
                            >영 수 증
                                <LoadingComponent open={loading} text="영수증을 불러오는 중..." />

                                <RecieptBox title={"결제정보"}>
                                    <ReceiptContents title={"거래종류"} content={prepaidMethod} />
                                    <ReceiptContents title={"거래일시"} content={reciept.prepaidPaid} />
                                </RecieptBox>
                                <RecieptBox title={"구매정보"}>
                                    <ReceiptContents title={"주문번호"} content={reciept.prepaidId} />
                                    <ReceiptContents title={"상 품 명"} content={"다람쥑스프레스 사전결제"} />
                                    <ReceiptContents title={"과세금액"} content={paymentFormat(Math.floor(reciept.prepaidAmount / 1.1)) + "원"} />
                                    <ReceiptContents title={"비과세금액"} content={"0원"} />
                                    <ReceiptContents title={"부가세"} content={paymentFormat(reciept.prepaidAmount - Math.floor(reciept.prepaidAmount / 1.1)) + "원"} />
                                    <ReceiptContents title={"합계금액"} content={paymentFormat(reciept.prepaidAmount) + "원"} />
                                </RecieptBox>
                                <RecieptBox title={"업체정보"}>
                                    <ReceiptContents title={"상호"} content={"(주)다람쥑스프레스"} />
                                    <ReceiptContents title={"사업자등록번호"} content={"012-34-56789"} />
                                    <ReceiptContents title={"주소"} content={"깊은 산 속"} />
                                </RecieptBox>

                            </Box>
                            <TermBox></TermBox>
                            <Box marginBottom={"500px"} ref={blankRef} display={"none"}></Box>
                        </> : <></>}
                        {reciept.paid ? <>
                            <Box
                                sx={{
                                    width: "90%",
                                    fontWeight: "bold",
                                    fontSize: "25px",
                                    display: "flex",
                                    justifyContent: "center",
                                    flexWrap: "wrap"
                                }}
                            >영 수 증
                                <RecieptBox title={"결제정보"}>
                                    <ReceiptContents title={"거래종류"} content={method} />
                                    <ReceiptContents title={"거래일시"} content={reciept.paid} />
                                </RecieptBox>
                                <RecieptBox title={"구매정보"}>
                                    <ReceiptContents title={"주문번호"} content={reciept.paymentId} />
                                    <ReceiptContents title={"상 품 명"} content={"다람쥑스프레스 사후결제"} />
                                    <ReceiptContents title={"과세금액"} content={paymentFormat(Math.floor(reciept.amount / 1.1)) + "원"} />
                                    <ReceiptContents title={"비과세금액"} content={"0원"} />
                                    <ReceiptContents title={"부가세"} content={paymentFormat(reciept.amount - Math.floor(reciept.amount / 1.1)) + "원"} />
                                    <ReceiptContents title={"합계금액"} content={paymentFormat(reciept.amount) + "원"} />
                                </RecieptBox>
                                <RecieptBox title={"업체정보"}>
                                    <ReceiptContents title={"상호"} content={"(주)다람쥑스프레스"} />
                                    <ReceiptContents title={"사업자등록번호"} content={"012-34-56789"} />
                                    <ReceiptContents title={"주소"} content={"깊은 산 속"} />
                                </RecieptBox>
                            </Box>
                            <TermBox></TermBox>
                        </> : <></>
                        }
                    </> : <></>}
                    <Button
                        variant="contained"
                        sx={{
                            width: "90%",
                            fontSize: "20px",
                            fontWeight: "bold",
                            position: "fixed",
                            bottom: "5%"
                        }}
                        onClick={handlePrint}
                        ref={printBtnRef}
                    >
                        프 린 트
                    </Button>
                </Box>
            </Box>

        </Layout >

    )
}
export default Reciept;