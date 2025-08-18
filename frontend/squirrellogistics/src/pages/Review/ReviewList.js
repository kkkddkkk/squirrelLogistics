import { useEffect, useState } from "react";
import { Layout, ListBoxContainer, SubTitle, TwoBtns } from "../../components/common/CommonForCompany";
import { Box, Grid, Typography } from "@mui/material";
import ReviewModal from "../../components/review/ReviewModal";
import ReviewContent from "../../components/review/ReviewContent";
import axios from "axios";
import ReviewModalForList from "../../components/review/ReviewModalForList";

const ReviewList = () => {

    const [isExpand, setIsExpand] = useState(false);
    const [scope, setScope] = useState(0);
    const [isreviewed, setIsReviewed] = useState(true);
    const [modal, setModal] = useState(false);
    const [reviewList, setReviewList] = useState([]);
    const [thisReview, setThisReview] = useState([]);
    const [dates, setDates] = useState([]);
    const [changed, setChanged] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/public/review/list`)
            .then(res => {
                setReviewList(res.data);
                const dateSet = [...new Set(res.data.map(report => report.regDate.toString().slice(0, 10)))];
                setDates(dateSet);
            })
    }, [changed])

    const handleDelReview = (review) => {
        axios.delete(`http://localhost:8080/api/public/review/${review.reviewId}`)
            .then(res => {
                console.log('삭제 성공', res.data)
                setChanged(true);
            }).catch(err => console.error('삭제 실패', err));

    }

    const handleModiReview = (review) => {
        setChanged(false);
        setThisReview(review);
        setModal(true);
    }

    return (
        <Layout title={"내 리뷰목록"}>

            <Grid container width={"100%"}>
                <Grid size={3} />
                <Grid size={6}>
                    {dates.map((date) => (
                        <Box marginBottom={"5%"}>
                            <SubTitle>{date}</SubTitle>
                            {reviewList.map((review, idx) => (
                                review.regDate.toString().slice(0, 10) == date ?
                                    <>
                                        <ReviewContent
                                            key={idx}
                                            header={`${review.startAddress.toString().slice(0, 15)}... > ${review.endAddress.toString().slice(0, 15)}...`}
                                            driverImg={"https://www.otterspecialistgroup.org/osg-newsite/wp-content/uploads/2017/04/ThinkstockPhotos-827261360-2000x1200.jpg"}
                                            driverName={review.driverName}
                                            content={review.reason}
                                            setModal={setModal}
                                            scope={review.rating}
                                            setScope={setScope}
                                            review={thisReview}
                                            setReview={() => setThisReview(review)}
                                            assignedId={review.assignedId}
                                            reviewId={review.reviewId}
                                            delReviewFunc={()=>handleDelReview(review)}
                                            modiReviewFunc={() => handleModiReview(review)}
                                        ></ReviewContent>
                                    </>
                                    : <></>
                            ))
                            }
                        </Box>
                    ))}
                    <ReviewModalForList
                        modal={modal}
                        setModal={setModal}
                        review={thisReview}
                        setReview={setThisReview}
                        changed={changed}
                        setChanged={setChanged}

                    ></ReviewModalForList>
                </Grid>
                <Grid size={3} />
            </Grid>
        </Layout>
    )
}
export default ReviewList;