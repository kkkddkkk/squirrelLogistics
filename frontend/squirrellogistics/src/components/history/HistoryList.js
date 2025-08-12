import { Box, Button, Grid, Modal, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListBoxContainer, Title, TwoBtns } from "../common/CommonForCompany";
import StarRate from "../review/StarRate";
import ReviewModal from "../review/ReviewModal";

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

const HistoryList = ({stopOver1, stopOver2, stopOver3, caution, mountainous, isreviewed, setIsReviewed}) => {
    const [params] = useSearchParams();
    const date = params.get("date");

    const [isExpand, setIsExpand] = useState(false);
    // const [stopOver1, setStopOver1] = useState("1번입니다");
    // const [stopOver2, setStopOver2] = useState('');
    // const [stopOver3, setStopOver3] = useState("3번입니다");
    // const [caution, setCaution] = useState(true);
    // const [mountainous, setMountainous] = useState(false);
    const [scope, setScope] = useState(5);
    // const [isreviewed, setIsReviewed] = useState(true);
    const [modal, setModal] = useState(false);


    const showTransactionStatement = () => {
        window.open(`${window.location.origin}/company/transactionStatement`, 'name', 'width=1000, height=600');
    }

    const showReciept = () => {
        window.open(`${window.location.origin}/company/reciept`, 'name', 'width=500, height=600');
    }

    const showReport = () => {
        window.open(`${window.location.origin}/company/report`, 'name', 'width=1000, height=600');
    }

    return (
        <>
            <ListBoxContainer isExpand={isExpand} setIsExpand={setIsExpand} header={"id.start->id.end"}>
                <Grid container sx={{ margin: "2%" }}>
                    {stopOver1 != '' ? <Grid size={12}>경유지1: {stopOver1}</Grid> : <></>}
                    {stopOver2 != '' ? <Grid size={12}>경유지2: {stopOver2}</Grid> : <></>}
                    {stopOver3 != '' ? <Grid size={12}>경유지3: {stopOver3}</Grid> : <></>}
                    {caution ? <Grid size={12}><br />취급주의물품 포함</Grid> : <></>}
                    {mountainous ? <Grid size={12}>{!caution ? <br /> : <></>}산간지역 포함</Grid> : <></>}
                    <Grid size={12} sx={{
                        borderTop: "1px solid #909095", borderBottom: "1px solid #909095"
                        , padding: "8px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        margin: "8px 0"
                    }}>
                        <TwoBtns
                            children1={"명세서"} func1={showTransactionStatement}
                            children2={"영수증"} func2={showReciept}
                        />
                        <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}> 총 000 원</Typography>
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
                            <Typography sx={{ display: "inline-block", marginLeft: "7px" }}>운전자명(차종)</Typography>
                        </Box>
                        {isreviewed ? <StarRate scope={scope} setScope={setScope} /> : <></>}

                    </Grid>
                    <Grid size={12} sx={{ display: "flex", justifyContent: "end", margin: "5px 0" }}>
                        <TwoBtns
                            children1={"신고"} func1={showReport}
                            children2={isreviewed ? "리뷰 수정" : "리뷰 작성"} func2={() => setModal(true)}
                        />

                    </Grid>
                </Grid>

            </ListBoxContainer>
            <ReviewModal modal={modal} setModal={setModal} scope={scope} setScope={setScope} isreviewed={isreviewed}></ReviewModal>
        </>

    )
}
export default HistoryList;