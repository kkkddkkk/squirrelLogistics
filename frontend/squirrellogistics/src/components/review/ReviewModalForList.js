import { Box, Modal, TextField, Typography } from "@mui/material";
import StarRate from "./StarRate";
import { OneBigBtn, SubTitle, TwoBtns } from "../common/CommonForCompany";
import { useEffect, useState } from "react";
import axios from "axios";
import StarRateMemo from "./StarRate";


const ReviewModalForList = ({ modal, setModal, review, setReview, changed, setChanged }) => {

    const modiReview = () => {//수정
        review.regDate = review.regDate.split('.')[0];
        review.regDate = review.regDate.replace('T', ' ');
        console.log(review);
        axios.put(`http://localhost:8080/api/public/review/${review.reviewId}`, review)
            .then(res => {
                console.log('수정 성공', res.data)
                setChanged(true);
                setModal(false);
            }).catch(err => console.error('수정 실패', err));
    }

    const delReview = () => {//삭제
        axios.delete(`http://localhost:8080/api/public/review/${review.reviewId}`)
            .then(res => {
                console.log('삭제 성공', res.data)
                setChanged(true);
                setModal(false);
            }).catch(err => console.error('삭제 실패', err));
    }

    const writingReview = (e => {//인풋 수정 시 review set
        review[e.target.name] = e.target.value;
        setReview({ ...review });

    })

    const [scope, setScope] = useState(review.rating);
    useEffect(() => {//별점 동기화
        if (review.rating != null) {
            setScope(review.rating);
        }
        console.log(review);
    }, [review.rating]);

    useEffect(() => {//별점 클릭 시 별점 변동
        setReview(prev => ({
            ...prev,
            rating: scope
        }));
    }, [scope])

    return (
        <Modal open={modal} onClose={() => setModal(false)}
        >
            <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                aspectRatio: "2/1",
                bgcolor: "background.paper",
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap"
            }}>
                <Box
                    sx={{
                        width: "20%",
                        margin: "5% 5% 0 5%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap"
                    }}
                >
                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap"
                    }}>
                        <Box
                            component="img"
                            sx={{
                                width: "100%",
                                aspectRatio: "1/1",
                                borderRadius: "100%",
                                marginBottom: "5%"
                            }}
                            alt="OtterImg"
                            src="https://www.otterspecialistgroup.org/osg-newsite/wp-content/uploads/2017/04/ThinkstockPhotos-827261360-2000x1200.jpg"
                        />
                        <Typography sx={{ marginBottom: "10%" }}>{review.driverName}</Typography>
                        <Box width={"100%"} display={"flex"} justifyContent={"center"}>
                            <StarRate modifying={true} scope={scope} setScope={setScope} />
                        </Box>
                    </Box>

                </Box>
                <TextField name="reason" rows={15} multiline sx={{ width: "60%", margin: "5% 5% 0 0" }} value={review.reason} onChange={writingReview}></TextField>
                <Box width={"60%"} display={"flex"} justifyContent={"center"} alignItems={"center"} margin={"5%"}>
                    <TwoBtns children1={"리뷰 삭제"} func1={delReview} children2={"리뷰 수정"} func2={modiReview}></TwoBtns>
                </Box>

            </Box>
        </Modal>
    )
}

export default ReviewModalForList;