import { Box, Grid, Modal, Typography, useTheme } from "@mui/material";
import ActualMap from "../../components/actualCalc/ActualMap";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { useEffect, useMemo, useState } from "react";
import { Layout, paymentFormat, SubTitle, Title, TwoBtns } from "../../components/common/CommonForCompany";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PlaceIcon from "@mui/icons-material/Place";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import { useSearchParams } from "react-router-dom";
import { getDetailHistory } from "../../api/company/historyApi";
import LiveMapComponent from "../../components/deliveryMap/LiveMapComponent";
import { useCompanyStream, useDriverStream } from "../../api/deliveryRequest/driverStreamAPI";
import { buildWaypointViews, buildMainStatus } from "./trackingUtil";
import CommonList from "../../components/common/CommonList";
import { CommonSmallerTitle, CommonSubTitle, CommonTitle } from "../../components/common/CommonText";
import { OneButtonAtLeft, TwoButtonsAtRight } from "../../components/common/CommonButton";

//작성자: 고은설.
//기능: 폴링 쿨타임 셋업용.
const POLL_INTERVAL = 30; // 30초

const DetailHistory = () => {
    const { moveToActualCalc, moveBack } = usePaymentMove();


    const [params] = useSearchParams();
    const assignedId = params.get("assignId");
    const [detailContent, setDetailContent] = useState([]);
    const thisTheme = useTheme();

    //고은설: 쿨타임 차감용.
    const [cooldown, setCooldown] = useState(POLL_INTERVAL);
    const colorOf = (state) => {
        switch (state) {
            case "집하 완료":
            case "운송 완료":
                return "#31A04F";
            case "도착":
                return "#34699A";
            case "이동중":
                return "#F59E0B";
            case "정지":
                return "#D14343";
            default:
                return "#9AA5B1";
        }
    };

    const iconOf = (state) => {
        switch (state) {
            case "집하 완료":
            case "운송 완료":
                return <CheckBoxIcon sx={{ color: colorOf(state) }} />;
            case "도착":
                return <PlaceIcon sx={{ color: colorOf(state) }} />;
            case "이동중":
                return <DirectionsCarIcon sx={{ color: colorOf(state) }} />;
            case "정지":
                return <PauseCircleIcon sx={{ color: colorOf(state) }} />;
            default:
                return <MoreHorizIcon sx={{ color: colorOf(state) }} />;
        }
    };

    //고은설: 상태값 가져오기.
    const fetchDetail = () => {
        if (!assignedId) return;
        getDetailHistory({ assignedId })
            .then((data) => {
                setDetailContent(data || {});
                setCooldown(POLL_INTERVAL); // 성공 시 타이머 리셋
            })
            .catch((err) => {
                console.error("데이터 가져오기 실패", err);
                setCooldown(POLL_INTERVAL);
            });
    };


    useEffect(() => {
        fetchDetail();
    }, [assignedId]);

    //고은설: 폴링 타이머.
    useEffect(() => {
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    fetchDetail(); // 자동 새로고침
                    return POLL_INTERVAL;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [assignedId]);

    useEffect(() => {
        if (!detailContent?.statuses || detailContent.statuses.length === 0) return;

        const lastStatus = detailContent.statuses[detailContent.statuses.length - 1]?.status;

        if (lastStatus === "COMPLETED") {
            moveToActualCalc({
                assignedId,
                reported: false,
            });
        }
    }, [detailContent, assignedId, moveToActualCalc]);

    //고은설: 경유지 운송 상태값 가공.
    const views = buildWaypointViews(detailContent?.waypoints, detailContent?.statuses);

    const handleCancel = () => {
        /* eslint-disable no-restricted-globals */
        if (confirm("정말 예약을 취소하시겠습니까?")) {
            console.log("예약취소")
        }
    }

    const live = useCompanyStream(
        () => localStorage.getItem("accessToken"),
        detailContent?.driverId // 조회할 기사 driverId
    );
    const mergedRoute = useMemo(() => {
        if (!detailContent?.driverId) return null;

        return {
            ...live, // 실시간 위치, visited/expected
            waypoints: detailContent.waypoints || [],
            statuses: detailContent.statuses || [],
        };
    }, [detailContent, live]);
    return (
        <>
            <CommonTitle>세부내역</CommonTitle>
            <Grid container spacing={3} marginBottom={10} alignItems="stretch">
                <Grid size={2} />
                <Grid size={4} sx={{ aspectRatio: 1 / 1 }}>
                    <LiveMapComponent route={mergedRoute} onRefresh />
                </Grid>

                <Grid size={4} sx={{ display: "flex", flexDirection: "column" }}>
                    <CommonSubTitle>{buildMainStatus(detailContent?.statuses, detailContent?.waypoints)}</CommonSubTitle>
                    <Box marginTop={"5%"} />
                    {views.map((v) => (
                        <Box
                            key={v.index}
                            width="100%"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb="5%"
                        >
                            <CommonSmallerTitle>{v.role}: {v.address}</CommonSmallerTitle>
                            <Box display="flex" alignItems="center" gap="8px">
                                {iconOf(v.state)}
                                <Typography sx={{ 
                                    fontSize: "0.85rem", 
                                    fontWeight: "bold", 
                                    color: colorOf(v.state),
                                    whiteSpace: "nowrap"
                                    }}>
                                    {v.state}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                    <Box sx={{ flexGrow: 1 }} />
                    <Box display="flex" justifyContent="space-between" mt="5%">
                        <OneButtonAtLeft clickEvent={fetchDetail}>새로고침({cooldown}s)</OneButtonAtLeft>
                        <TwoButtonsAtRight
                            leftTitle={"예약 취소"}
                            leftClickEvent={() => alert("예약취소")}
                            leftColor={thisTheme.palette.error.main}
                            rightTitle={"뒤로가기"}
                            rightClickEvent={() => moveBack()}
                            gap={2}
                        />
                    </Box>
                </Grid>
                <Grid size={2} />
            </Grid>
        </>
    )
}

export default DetailHistory;