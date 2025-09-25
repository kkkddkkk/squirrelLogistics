import { Box, Button, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ListBoxContainer, OneBigBtn, OneBtnAtRight, paymentFormat, TwoBtns } from "../common/CommonForCompany";
import StarRate from "../review/StarRate";
import ReviewModal from "../review/ReviewModal";
import axios from "axios";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { getTodayContent } from "../../api/company/historyApi";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import LoadingComponent from "../common/LoadingComponent";
import { TwoButtonsAtLeft, TwoButtonsAtRight } from "../common/CommonButton";
import { theme } from "../common/CommonTheme";
import API_SERVER_HOST from "../../api/apiServerHost";

export const Buttons = ({ children, func, disabled }) => {
    return (
        <Button
            variant="contained"
            sx={{ marginRight: "7px" }}
            onClick={func}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}

const HistoryList = ({ assignedId, start, end, assignStatus, isMobile, width }) => {
    const accesstoken = localStorage.getItem('accessToken');


    const { moveToActualCalc } = usePaymentMove();
    const { moveToDetailHistory } = useHistoryMove();
    const [isExpand, setIsExpand] = useState(false);
    const [todayContent, setTodayContent] = useState([]);
    const [changed, setChanged] = useState(false);
    const [reported, setReported] = useState(true);
    const [loading, setLoading] = useState(false);
    const [review, setReview] = useState({
        reviewId: 0,
        assignedId: assignedId,
        rating: 5,
        reason: "",
        driverName: "",
        carName: "",
        state: 'PENDING'
    });

    const thisTheme = useTheme();

    useEffect(() => {
        if (!isExpand) return;
        setLoading(true);
        getTodayContent({ assignedId })
            .then(data => {
                setTodayContent(data || {});
                setScope((data && data.rating) || 0);
            })
            .catch(err => {
                // console.error("데이터 가져오기 실패", err);
            })
            .finally(() => setLoading(false));
    }, [isExpand, changed]);

    const [scope, setScope] = useState(0);
    const [modal, setModal] = useState(false);

    const showTransactionStatement = () => {
        window.open(`${window.location.origin}/company/transactionStatement?paymentId=${todayContent?.paymentId}&token=${accesstoken}`, 'name', 'width=1000, height=600');
    }

    const showReciept = () => {
        window.open(`${window.location.origin}/company/reciept?paymentId=${todayContent?.paymentId}&token=${accesstoken}`, 'name', 'width=500, height=600');
    }

    const showReport = () => {
        const mode = thisTheme.palette.mode
        window.open(
            `${window.location.origin}/company/report?id=${assignedId}&rId=${todayContent?.reportId}&token=${accesstoken}?mode=${mode}`,
            'reportWindow',
            'width=1000,height=600'
        );
    }

    const openModal = () => {
        axios.get(`${API_SERVER_HOST}/review`, {
            params: { assignedId: assignedId },
            headers: {
                Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
            },
        }).then(res => {
            setReview({
                reviewId: res.data.reviewId ?? 0,
                assignedId: assignedId,
                rating: res.data.rating ?? 5,
                reason: res.data.reason ?? "",
                driverName: res.data.driverName ?? "",
                carName: res.data.carName ?? "",
                state: res.data.rating != null ? 'SUBMITTED' : 'PENDING'
            });
            setChanged(false);
            setModal(true);
        })
    }

    const handleSecondPayment = () => {
        moveToActualCalc({ assignedId, reported: todayContent.reportId ? true : false });
    }

    return (
        <ListBoxContainer id={assignedId} header={`출발지: ${start}\n도착지: ${end}`} useButton={true}
            assignStatus={assignStatus} isExpand={isExpand} setIsExpand={setIsExpand} loading={loading}
            width={width}>
            <LoadingComponent open={loading} text="이용기록을 불러오는 중..." />
            {!isExpand ? <></> :
                <Grid sx={{ margin: "2%" }} size={12}>
                    {isExpand && !loading ?
                        <Grid container sx={{ margin: "2%" }}>
                            {todayContent.dropOrder1 ? <Grid size={12}>경유지1: {todayContent.dropOrder1}</Grid> : <></>}
                            {todayContent.dropOrder2 ? <Grid size={12}>경유지2: {todayContent.dropOrder2}</Grid> : <></>}
                            {todayContent.dropOrder3 ? <Grid size={12}>경유지3: {todayContent.dropOrder3}</Grid> : <></>}
                            {todayContent.caution ? <Grid size={12}><br />취급주의물품 포함</Grid> : <></>}
                            {todayContent.mountainous ? <Grid size={12}>{!todayContent.caution ? <br /> : <></>}산간지역 포함</Grid> : <></>}
                            <Grid size={12} sx={{
                                borderTop: "1px solid #909095", borderBottom: "1px solid #909095"
                                , padding: "8px", display: "flex", justifyContent: isMobile ? "end" : "space-between", alignItems: "center",
                                margin: "8px 0"
                            }}>
                                {isMobile ? <></> :
                                    <TwoButtonsAtLeft
                                        leftTitle={"명세서"}
                                        leftClickEvent={showTransactionStatement}
                                        rightTitle={"영수증"}
                                        rightClickEvent={showReciept}
                                        gap={1}
                                    />
                                }

                                <Typography sx={{ fontSize: isMobile ? "16px" : "22px", fontWeight: "bold" }}> 총 {todayContent.actualFee ? paymentFormat(todayContent.actualFee) : paymentFormat(todayContent.estimatedFee)} 원</Typography>
                            </Grid>
                            <Grid size={12} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Box
                                        component="img"
                                        sx={{
                                            height: "40px",
                                            aspectRatio: "1/1",
                                            borderRadius: "100%",
                                            marginTop: "2%"
                                        }}
                                        alt="Img"
                                        src={`${todayContent.driverImg}`}
                                    />
                                    <Typography sx={{ display: "inline-block", marginLeft: "7px" }}>{todayContent.driverName}<br />({todayContent.carName})</Typography>
                                </Box>
                                {assignStatus === "배송완료" && todayContent.rating != 0 ? <StarRate scope={scope} setScope={setScope} /> : <></>}

                            </Grid>
                            <Grid size={12} sx={{ display: "flex", justifyContent: "end", margin: "5px 0" }}>
                                {assignStatus === "배송완료" ?
                                    <TwoButtonsAtRight
                                        leftTitle={todayContent.reportId != 0 ? "신고 내역" : "신고"}
                                        leftClickEvent={showReport}
                                        leftColor={theme.palette.error.main}
                                        rightTitle={todayContent.reviewId != 0 ? "리뷰 수정" : "리뷰 작성"}
                                        rightClickEvent={openModal}
                                        gap={1}
                                    /> : <></>
                                }
                                {assignStatus === "배송중" || assignStatus === "예약" ?
                                    <OneBtnAtRight func={() => moveToDetailHistory(assignedId)}>
                                        배송현황
                                    </OneBtnAtRight> : <></>
                                }

                                {assignStatus === "미정산" ?
                                    <OneBtnAtRight func={handleSecondPayment}>
                                        정&nbsp;&nbsp;&nbsp;산
                                    </OneBtnAtRight> : <></>
                                }

                                {assignStatus === "취소" ?
                                    <OneBtnAtRight func={handleSecondPayment}>
                                        환불신청
                                    </OneBtnAtRight> : <></>
                                }
                            </Grid>
                        </Grid> : <></>
                    }
                </Grid>
            }
            <ReviewModal
                modal={modal}
                setModal={setModal}
                scope={scope}
                setScope={setScope}
                assignedId={assignedId}
                review={review}
                setReview={setReview}
                changed={changed}
                setChanged={setChanged}
                driverImg={todayContent.driverImg}
            ></ReviewModal>
        </ListBoxContainer>


    )
}
export default HistoryList;