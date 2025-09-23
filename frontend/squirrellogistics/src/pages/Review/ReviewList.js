import { useEffect, useState } from "react";
import { Layout, NoneOfList, SubTitle } from "../../components/common/CommonForCompany";
import { Box, Grid, useTheme } from "@mui/material";
import ReviewContent from "../../components/review/ReviewContent";
import axios from "axios";
import ReviewModalForList from "../../components/review/ReviewModalForList";
import Logo from '../../components/common/squirrelLogisticsLogo.png';
import darkLogo from '../../components/common/squirrelLogisticsLogo_dark.png';
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import { ButtonContainer, One100ButtonAtCenter } from "../../components/common/CommonButton";
import LoadingComponent from "../../components/common/LoadingComponent";
import { CommonSubTitle, CommonTitle } from "../../components/common/CommonText";

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

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:8080/api/review/list`, {
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
        axios.delete(`http://localhost:8080/api/review/${review.reviewId}`, {
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
            <Grid container width={"100%"} marginBottom={5} minHeight={"100vh"}>
                <LoadingComponent open={loading} text="내 리뷰목록을 불러오는 중..." />
                <Grid size={3} />
                <Grid size={6}>
                    {dataLengths == 0 ?
                        <NoneOfList logoSrc={thisTheme.palette.mode === "light" ? Logo : darkLogo}>아직 작성한 리뷰가 없습니다.</NoneOfList> :
                        (dates.map((date) => (
                            <Box marginBottom={"5%"}>
                                <CommonSubTitle>{date}</CommonSubTitle>
                                {reviewList.map((review, idx) => (
                                    review.regDate.toString().slice(0, 10) == date ?
                                        <ReviewContent
                                            key={idx}
                                            header={`출발지: ${review.startAddress}\n도착지: ${review.endAddress}`}
                                            driverImg={`http://localhost:8080/api/public/driverImage/${review.profileImg}`}
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

                    ></ReviewModalForList>

                    <ButtonContainer marginTop={10} marginBottom={5}>
                        <One100ButtonAtCenter height={50} clickEvent={() => moveBack()}>뒤로가기</One100ButtonAtCenter>
                    </ButtonContainer>
                </Grid>
                <Grid size={3} />
            </Grid>
        </>
    )
}
export default ReviewList;