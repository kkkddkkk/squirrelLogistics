import { useEffect, useState } from "react";
import { cutAddress, Layout, NoneOfList, SubTitle } from "../../components/common/CommonForCompany";
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import ReviewContent from "../../components/review/ReviewContent";
import axios from "axios";
import ReviewModalForList from "../../components/review/ReviewModalForList";
import Logo from '../../components/common/squirrelLogisticsLogo.png';
import darkLogo from '../../components/common/squirrelLogisticsLogo_dark.png';
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import { ButtonContainer, One100ButtonAtCenter } from "../../components/common/CommonButton";
import LoadingComponent from "../../components/common/LoadingComponent";
import { CommonSubTitle, CommonTitle } from "../../components/common/CommonText";
import API_SERVER_HOST from "../../api/apiServerHost";

const ReviewList = () => {
    const accesstoken = localStorage.getItem('accessToken');

    const [loading, setLoading] = useState(false);
    const { moveBack } = useHistoryMove();
    const [scope, setScope] = useState(0);
    const [modal, setModal] = useState(false);
    const [reviewList, setReviewList] = useState([]);
    const [thisReview, setThisReview] = useState([]);
    const [dates, setDates] = useState([]);
    const [changed, setChanged] = useState(false);
    const [dataLengths, setDataLengths] = useState(0);

    const thisTheme = useTheme();
    const isMobile = useMediaQuery(thisTheme.breakpoints.down('sm'));

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_SERVER_HOST}/review/list`, {
            headers: {
                Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
            },
        })
            .then(res => {
                setReviewList(res.data);
                const dateSet = [...new Set(res.data.map(report => report.regDate.toString().slice(0, 10)))];
                setDates(dateSet);
                setDataLengths(res.data.length);
            }).finally(() => setLoading(false));
    }, [changed])

    const handleDelReview = (review) => {
        axios.delete(`${API_SERVER_HOST}/review/${review.reviewId}`, {
            headers: {
                Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
            },
        })
            .then(res => {
                setChanged(true);
            }).catch();

    }

    const handleModiReview = (review) => {
        setChanged(false);
        setThisReview(review);
        setModal(true);
    }

    return (
        <>
            <CommonTitle>내 리뷰목록</CommonTitle>
            <Grid container width={"100%"} marginBottom={5} minHeight={isMobile ? "90vh" : "100vh"}
                paddingLeft={isMobile ? "10%" : "25%"} paddingRight={isMobile ? "10%" : "25%"}>
                <LoadingComponent open={loading} text="내 리뷰목록을 불러오는 중..." />
                <Grid size={12} maxHeight={isMobile ? "65vh" : ""} overflow={"auto"}>
                    {dataLengths == 0 ?
                        <NoneOfList logoSrc={thisTheme.palette.mode === "light" ? Logo : darkLogo}>아직 작성한 리뷰가 없습니다.</NoneOfList> :
                        (dates.map((date) => (
                            <Box marginBottom={"5%"}>
                                <CommonSubTitle>{date}</CommonSubTitle>
                                {reviewList.map((review, idx) => (
                                    review.regDate.toString().slice(0, 10) == date ?
                                        <ReviewContent
                                            key={idx}
                                            header={`출발지: ${isMobile ? cutAddress(review.startAddress) : review.startAddress}\n도착지: ${isMobile ? cutAddress(review.endAddress) : review.endAddress}`}
                                            driverImg={`${API_SERVER_HOST}/public/driverImage/${review.profileImg}`}
                                            driverName={review.driverName}
                                            content={review.reason}
                                            setModal={setModal}
                                            scope={review.rating}
                                            setScope={setScope}
                                            review={thisReview}
                                            setReview={() => setThisReview(review)}
                                            assignedId={review.assignedId}
                                            reviewId={review.reviewId}
                                            delReviewFunc={() => handleDelReview(review)}
                                            modiReviewFunc={() => handleModiReview(review)}
                                            isMobile={isMobile}
                                        ></ReviewContent>
                                        : <></>
                                ))
                                }
                            </Box>
                        ))
                        )
                    }
                    < ReviewModalForList
                        modal={modal}
                        setModal={setModal}
                        review={thisReview}
                        setReview={setThisReview}
                        changed={changed}
                        setChanged={setChanged}
                        isMobile={isMobile}
                    ></ReviewModalForList>
                </Grid>
                <Grid size={12}>
                    <ButtonContainer marginBottom={5}>
                        <One100ButtonAtCenter height={50} clickEvent={() => moveBack()}>뒤로가기</One100ButtonAtCenter>
                    </ButtonContainer>
                </Grid>
            </Grid>
        </>
    )
}
export default ReviewList;