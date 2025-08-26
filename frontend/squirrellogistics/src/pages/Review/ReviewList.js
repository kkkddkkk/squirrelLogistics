import { useEffect, useState } from "react";
import { Layout, NoneOfList, SubTitle } from "../../components/common/CommonForCompany";
import { Box, Grid } from "@mui/material";
import ReviewContent from "../../components/review/ReviewContent";
import axios from "axios";
import ReviewModalForList from "../../components/review/ReviewModalForList";
import Logo from '../../components/common/squirrelLogisticsLogo.png';

const ReviewList = () => {
    const accesstoken = localStorage.getItem('accessToken');

    const [scope, setScope] = useState(0);
    const [modal, setModal] = useState(false);
    const [reviewList, setReviewList] = useState([]);
    const [thisReview, setThisReview] = useState([]);
    const [dates, setDates] = useState([]);
    const [changed, setChanged] = useState(false);
    const [dataLengths, setDataLengths] = useState(0);

    useEffect(() => {
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
            })
    }, [changed])

    const handleDelReview = (review) => {
        axios.delete(`http://localhost:8080/api/public/review/${review.reviewId}`, {
            headers: {
                Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
            },
        })
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
                    {dataLengths == 0 ?
                        <NoneOfList logoSrc={Logo}>아직 작성한 리뷰가 없습니다.</NoneOfList> :
                        (dates.map((date) => (
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
                                                delReviewFunc={() => handleDelReview(review)}
                                                modiReviewFunc={() => handleModiReview(review)}
                                            ></ReviewContent>
                                        </>
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
                </Grid>
                <Grid size={3} />
            </Grid>
        </Layout >
    )
}
export default ReviewList;