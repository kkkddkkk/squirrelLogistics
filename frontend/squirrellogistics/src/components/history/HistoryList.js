import { Box, Button, Grid, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useEffect, useState } from "react";
import { ListBoxContainer, TwoBtns } from "../common/CommonForCompany";
import StarRate from "../review/StarRate";
import ReviewModal from "../review/ReviewModal";
import axios from "axios";

export const Buttons = ({ children, func }) => {
    return (
        <Button
            variant="contained"
            sx={{ marginRight: "7px" }}
            onClick={func}
        >
            {children}
        </Button>
    );
}

const HistoryList = ({ assignedId, start, end }) => {
    const [isExpand, setIsExpand] = useState(false);
    const [todayContent, setTodayContent] = useState([]);
    const [changed, setChanged] = useState(false);
    const [reported, setReported]= useState(true);
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
        axios.get(`http://localhost:8080/api/public/companyHistory/getTodayContent`, {
            params: { assignedId: assignedId }
        }).then(res => {
            setTodayContent(res.data);
            setScope(res.data.rating);
        })
    }, [isExpand, changed])

    const [scope, setScope] = useState(todayContent.rating);
    const [modal, setModal] = useState(false);

    const handleExpand = () => {
        if (!isExpand) setIsExpand(true);
        else setIsExpand(false);
    }

    let actualFeeFormat = todayContent?.actualFee != null
        ? todayContent.actualFee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : '0'



    const showTransactionStatement = () => {
        window.open(`${window.location.origin}/company/transactionStatement`, 'name', 'width=1000, height=600');
    }

    const showReciept = () => {
        window.open(`${window.location.origin}/company/reciept`, 'name', 'width=500, height=600');
    }

    const showReport = () => {
        window.open(`${window.location.origin}/company/report?id=${assignedId}&rId=${todayContent.reportId}`, 'name', 'width=1000, height=600');
    }

    const openModal = () => {
        axios.get(`http://localhost:8080/api/public/review`, {
            params: { assignedId: assignedId }
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

    return (
        <ListBoxContainer id={assignedId} header={`${start} -> ${end}`}>
            {!isExpand ?
                <ExpandMoreIcon cursor={"pointer"} onClick={handleExpand} />
                : <>
                    <ExpandLessIcon cursor={"pointer"} onClick={handleExpand} />
                    <Grid sx={{ margin: "2%" }} size={12}>
                        <Grid container sx={{ margin: "2%" }}>
                            {todayContent.dropOrder1 ? <Grid size={12}>경유지1: {todayContent.dropOrder1}</Grid> : <></>}
                            {todayContent.dropOrder2 != '' ? <Grid size={12}>경유지2: {todayContent.dropOrder2}</Grid> : <></>}
                            {todayContent.dropOrder3 != '' ? <Grid size={12}>경유지3: {todayContent.dropOrder3}</Grid> : <></>}
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
                                <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}> 총 {actualFeeFormat} 원</Typography>
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
                                        alt="OtterImg"
                                        src="https://www.otterspecialistgroup.org/osg-newsite/wp-content/uploads/2017/04/ThinkstockPhotos-827261360-2000x1200.jpg"
                                    />
                                    <Typography sx={{ display: "inline-block", marginLeft: "7px" }}>{todayContent.driverName}({todayContent.carName})</Typography>
                                </Box>
                                {todayContent.rating != 0 ? <StarRate scope={scope} setScope={setScope} /> : <></>}

                            </Grid>
                            <Grid size={12} sx={{ display: "flex", justifyContent: "end", margin: "5px 0" }}>
                                <TwoBtns
                                    children1={todayContent.reportId!=0?"신고 내역":"신고"} func1={showReport}
                                    children2={todayContent.reviewId != 0 ? "리뷰 수정" : "리뷰 작성"} func2={openModal}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </>
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