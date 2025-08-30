import { Box, Button, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ListBoxContainer, OneBigBtn, OneBtnAtRight, paymentFormat, TwoBtns } from "../common/CommonForCompany";
import StarRate from "../review/StarRate";
import ReviewModal from "../review/ReviewModal";
import axios from "axios";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { getTodayContent } from "../../api/company/historyApi";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";

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

const HistoryList = ({ assignedId, start, end, assignStatus, paymentStatus }) => {
    const accesstoken = localStorage.getItem('accessToken');

    const { moveToActualCalc } = usePaymentMove();
    const { moveToDetailHistory } = useHistoryMove();
    const [isExpand, setIsExpand] = useState(false);
    const [todayContent, setTodayContent] = useState([]);
    const [changed, setChanged] = useState(false);
    const [reported, setReported] = useState(true);
    const [review, setReview] = useState({
        reviewId: 0,
        assignedId: assignedId,
        rating: 5,
        reason: "",
        driverName: "",
        carName: "",
        state: 'PENDING'
    });

    useEffect(() => {
        if (!isExpand) return;
        getTodayContent({ assignedId })
            .then(data => {
                setTodayContent(data || {});
                setScope((data && data.rating) || 0);
            })
            .catch(err => {
                console.error("데이터 가져오기 실패", err);
            });
    }, [isExpand, changed]);

    const [scope, setScope] = useState(0);
    const [modal, setModal] = useState(false);

    const showTransactionStatement = () => {
        window.open(`${window.location.origin}/company/transactionStatement?paymentId=${todayContent?.paymentId}&token=${accesstoken}`, 'name', 'width=1000, height=600');
    }

    const showReciept = () => {
        window.open(`${window.location.origin}/company/reciept?paymentId=${todayContent?.paymentId}`, 'name', 'width=500, height=600');
    }

    const showReport = () => {
        if (todayContent.reportId) {

        }
        window.open(
            `${window.location.origin}/company/report?id=${assignedId}&rId=${todayContent?.reportId}&token=${accesstoken}`,
            'reportWindow',
            'width=1000,height=600'
        );
    }

    const openModal = () => {
        axios.get(`http://localhost:8080/api/review`, {
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
        <ListBoxContainer id={assignedId} header={`${start} → ${end}`} useButton={true}
            assignStatus={assignStatus} isExpand={isExpand} setIsExpand={setIsExpand}>
            {!isExpand ? <></> :
                <Grid sx={{ margin: "2%" }} size={12}>
                    <Grid container sx={{ margin: "2%" }}>
                        {todayContent.dropOrder1 ? <Grid size={12}>경유지1: {todayContent.dropOrder1}</Grid> : <></>}
                        {todayContent.dropOrder2 ? <Grid size={12}>경유지2: {todayContent.dropOrder2}</Grid> : <></>}
                        {todayContent.dropOrder3 ? <Grid size={12}>경유지3: {todayContent.dropOrder3}</Grid> : <></>}
                        {todayContent.caution ? <Grid size={12}><br />취급주의물품 포함</Grid> : <></>}
                        {todayContent.mountainous ? <Grid size={12}>{!todayContent.caution ? <br /> : <></>}산간지역 포함</Grid> : <></>}
                        <Grid size={12} sx={{
                            borderTop: "1px solid #909095", borderBottom: "1px solid #909095"
                            , padding: "8px", display: "flex", justifyContent: "space-between", alignItems: "center",
                            margin: "8px 0"
                        }}>
                            <TwoBtns
                                children1={"명세서"} func1={showTransactionStatement}
                                children2={"영수증"} func2={showReciept}
                            />
                            <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}> 총 {todayContent.actualFee ? paymentFormat(todayContent.actualFee) : paymentFormat(todayContent.estimatedFee)} 원</Typography>
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
                                    src= {`http://localhost:8080/api/public/driverImage/${todayContent.driverImg}`}
                                />
                                <Typography sx={{ display: "inline-block", marginLeft: "7px" }}>{todayContent.driverName}({todayContent.carName})</Typography>
                            </Box>
                            {assignStatus === "배송완료" && todayContent.rating != 0 ? <StarRate scope={scope} setScope={setScope} /> : <></>}

                        </Grid>
                        <Grid size={12} sx={{ display: "flex", justifyContent: "end", margin: "5px 0" }}>
                            {assignStatus === "배송완료" ?
                                <TwoBtns
                                    children1={todayContent.reportId != 0 ? "신고 완료" : "신고"} func1={showReport} disabled1={todayContent.reportId != 0}
                                    children2={todayContent.reviewId != 0 ? "리뷰 수정" : "리뷰 작성"} func2={openModal}
                                /> : (assignStatus === "배송중" || assignStatus === "예약" ?
                                    <OneBtnAtRight func={() => moveToDetailHistory(assignedId)}>
                                        세부내역 확인
                                    </OneBtnAtRight> : (assignStatus === "미정산" ?
                                        <OneBtnAtRight func={handleSecondPayment}>
                                            정&nbsp;&nbsp;&nbsp;산
                                        </OneBtnAtRight> : <></>))
                            }

                        </Grid>
                    </Grid>
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
            ></ReviewModal>
        </ListBoxContainer>


    )
}
export default HistoryList;