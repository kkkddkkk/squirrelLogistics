import { Box, Modal, Typography } from "@mui/material";
import ActualMap from "../../components/actualCalc/ActualMap";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { useEffect, useState } from "react";
import { Layout, paymentFormat, SubTitle, Title, TwoBtns } from "../../components/common/CommonForCompany";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useSearchParams } from "react-router-dom";
import { getDetailHistory } from "../../api/company/historyApi";
import LiveMapComponent from "../../components/deliveryMap/LiveMapComponent";
import { useDriverStream } from "../../api/deliveryRequest/driverStreamAPI";

const DetailHistory = () => {
    const { moveToSecondPayment, moveBack } = usePaymentMove();

    //작성자: 고은설.
    //설명: 기사의 실시간 위치를 출력하는 'LiveMapComponent'을 사용하는 법.
    //1. LiveMapComponent는 백엔드 서버가 보내주는 live데이터라는것을 받아서 지도로 그리고 있습니다!
    //2. 그 live데이터는 제가 만들어둔 useDriverStream api에 해당 할당 운송을 담당하는 기사 아이디를 넣어 아래처럼 얻을 수 있습니다!
    //3. detailContent로 운전기사 id 가져오는 부분이 추가된 다음 아래처럼 쓰실 수 있습니다!
    //4. useEffect를 통해 운전기사 id가 받기 전이라면 useDriverStream에서 오류가 뜰 가능성이 높아서 useEffect를통해 들어온 데이터가 null이 아닐때까지 로딩화면등으로 대체한면 안전할 것 같습니다!
    //5. 다만 문제는 현대 웹소켓 송수신 구조가 통신 경량화를 위해 이동중인 경로랑 좌표만을 보내고 있어서 저 지도를 가져오는 것 만으로는 운송의 실시간 최신 상태를 받아올 수 없습니다...
    //6. 따라서 해당 컴포넌트를 매 10-15초마다 새로고침하는 폴링 구조를 사용하시거나, ㅅㅈ
    const live = useDriverStream(27);

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
                    <LiveMapComponent route={live} onRefresh />
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