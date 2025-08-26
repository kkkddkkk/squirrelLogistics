import { Box, Modal, Typography } from "@mui/material";
import ActualMap from "../../components/actualCalc/ActualMap";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { useEffect, useState } from "react";
import { Layout, paymentFormat, SubTitle, Title, TwoBtns } from "../../components/common/CommonForCompany";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useSearchParams } from "react-router-dom";
import { getDetailHistory } from "../../api/company/historyApi";

const DetailHistory = () => {
    const { moveToSecondPayment, moveBack } = usePaymentMove();


    const [params] = useSearchParams();
    const assignedId = params.get("assignId");
    const [detailContent, setDetailContent] = useState([]);

    useEffect(() => {
        if (!assignedId) return;
        getDetailHistory({ assignedId })
            .then(data => {
                setDetailContent(data || {});
                console.log(data);
            })
            .catch(err => {
                console.error("데이터 가져오기 실패", err);
            });
    }, [assignedId]);

    const handleCancel = () => {
        /* eslint-disable no-restricted-globals */
        if (confirm("정말 예약을 취소하시겠습니까?")) {
            console.log("예약취소")
        }
    }

    return (
        <Layout title={"세부내역"}>
            <Box
                sx={{
                    width: "70%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignContent: "center"
                }}
            >
                <Box sx={{ width: "40%" }}>
                    {/* <ActualMap polyline={actualCalc?.actualPolyline}></ActualMap> */}
                </Box>
                <Box sx={{ width: "50%", aspectRatio: "1/1", overflowY: "auto", overflowX: "hidden" }}>
                    <Box width={"100%"} display={"flex"} justifyContent={"space-between"} marginBottom={"5%"}>
                        {detailContent?.status === "ASSIGNED" ?
                            <Title> 출발 예정: {detailContent?.wantToStart}</Title> :
                            <Title> 화물이 운송 중입니다.</Title>
                        }

                    </Box>

                    <Box width={"100%"} display={"flex"} justifyContent={"space-between"} marginBottom={"5%"}>
                        <SubTitle>출발지: {detailContent?.startAddress}</SubTitle>
                        <CheckBoxIcon sx={{ color: "#31A04F" }}></CheckBoxIcon>
                    </Box>
                    <Box width={"100%"} display={"flex"} justifyContent={"space-between"} marginBottom={"5%"}>
                        <SubTitle>경유지1: {detailContent?.dropOrder1}</SubTitle>
                        <CheckBoxIcon sx={{ color: "#31A04F" }}></CheckBoxIcon>
                    </Box>
                    <Box width={"100%"} display={"flex"} justifyContent={"space-between"} marginBottom={"5%"}>
                        <SubTitle>경유지2: {detailContent?.dropOrder2}</SubTitle>
                        <CheckBoxIcon sx={{ color: "#31A04F" }}></CheckBoxIcon>
                    </Box>
                    <Box width={"100%"} display={"flex"} justifyContent={"space-between"} marginBottom={"5%"}>
                        <SubTitle>경유지3: {detailContent?.dropOrder3}</SubTitle>
                        <CheckBoxIcon sx={{ color: "#31A04F" }}></CheckBoxIcon>
                    </Box>
                    <Box width={"100%"} display={"flex"} justifyContent={"space-between"} marginBottom={"5%"}>
                        <SubTitle>도착지: {detailContent?.endAddress}</SubTitle>
                        <CheckBoxIcon sx={{ color: "#31A04F" }}></CheckBoxIcon>
                    </Box>
                    <Box display={"flex"} justifyContent={"end"} marginTop={"5%"}>
                        <TwoBtns children1={"예약 취소"} func1={handleCancel} children2={"뒤로가기"} func2={() => moveBack()}></TwoBtns>
                    </Box>

                </Box>

            </Box >
        </Layout>
    )
}

export default DetailHistory;