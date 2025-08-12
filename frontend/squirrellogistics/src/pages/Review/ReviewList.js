import { useState } from "react";
import { Layout, ListBoxContainer, SubTitle, TwoBtns } from "../../components/common/CommonForCompany";
import { Box, Grid, Typography } from "@mui/material";
import StarRate from "../../components/review/StarRate";
import ReviewModal from "../../components/review/ReviewModal";
import ReviewContent from "../../components/review/ReviewContent";

const ReviewList = () => {

    const [isExpand, setIsExpand] = useState();
    const [scope, setScope] = useState();
    const [isreviewed, setIsReviewed] = useState(true);
    const [modal, setModal] = useState(false);

    return (
        <Layout title={"내 리뷰목록"}>
            <Grid container>
                <Grid size={3} />
                <Grid size={6}>
                    <SubTitle>0000.00.00.</SubTitle>
                    <ReviewContent
                        header={"id.start-id.end"}
                        driverImg={"https://www.otterspecialistgroup.org/osg-newsite/wp-content/uploads/2017/04/ThinkstockPhotos-827261360-2000x1200.jpg"}
                        driverName={"김도경"}
                        content={"리뷰내용"}
                        setModal={setModal}
                    ></ReviewContent>
                </Grid>
                <Grid size={3} />
            </Grid>
            <ReviewModal modal={modal} setModal={setModal} scope={scope} setScope={setScope} isreviewed={isreviewed}></ReviewModal>
        </Layout>
    )
}
export default ReviewList;