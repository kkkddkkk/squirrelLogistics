import { Box, Modal, TextField, Typography } from "@mui/material";
import StarRate from "./StarRate";
import { OneBigBtn, SubTitle, TwoBtns } from "../common/CommonForCompany";
import { useEffect, useState } from "react";
import axios from "axios";
import StarRateMemo from "./StarRate";
import { ButtonContainer, One100ButtonAtCenter, Two100Buttons, TwoButtonsAtCenter } from "../common/CommonButton";


const ReviewModal = ({ modal, setModal, assignedId, review, setReview, changed, setChanged, driverImg }) => {

    const accesstoken = localStorage.getItem('accessToken');

    const [localReview, setLocalReview] = useState({
        reason: "",
        rating: 0,
        reviewId: 0,
        driverName: "",
        carName: "",
        assignedId: assignedId ?? 0
    });

    // useEffect(() => {
    //     if(!assignedId) return;
    //     setLocalReview(prev => ({ ...prev, assignedId }));
    // }, [assignedId]);
    const [scope, setScope] = useState(localReview.rating);

    // useEffect(() => {
    //     if (review) {
    //         setLocalReview({
    //             reviewId: review.reviewId ?? 0,
    //             reason: review.reason ?? "",
    //             rating: review.rating ?? 0,
    //             driverName: review.driverName ?? "",
    //             carName: review.carName ?? "",
    //             assignedId: assignedId
    //         });
    //         setScope(review.rating ?? 0);
    //     }
    // }, [review]);

    useEffect(() => {
        if (!modal || !assignedId) return;

        if (review) {
            // 수정 모드
            setLocalReview({
                reviewId: review.reviewId,
                reason: review.reason ?? "",
                rating: review.rating ?? 0,
                driverName: review.driverName ?? "",
                carName: review.carName ?? "",
                assignedId
            });
            setScope(review.rating ?? 0);
        } else {
            // 신규 등록
            setLocalReview({
                reviewId: 0,
                reason: "",
                rating: 0,
                driverName: "",
                carName: "",
                assignedId
            });
            setScope(0);
        }
    }, [modal, assignedId, review]);

    const writingReview = (e) => {
        const { name, value } = e.target;
        setLocalReview(prev => ({ ...prev, [name]: value })); // null 체크 제거
    };

    const regiReview = () => {//등록
        if (scope == 0) {
            alert('별점을 등록해주세요.')
            return;
        }
        if (localReview.reason.length < 5) {
            alert("5자 이상의 리뷰를 등록해주세요.");
            return;
        }
        const payload = {
            ...localReview,  // TextField 등 입력값
            rating: scope    // 사용자가 선택한 별점
        };
        axios.post(`http://localhost:8080/api/review`, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
            },

        })
            .then(res => {
                console.log('등록 성공', res.data)
                setChanged(true);
                setModal(false);
            }).catch(err => console.error('등록 실패', err));
    }

    const modiReview = () => {//수정
        const payload = {
            ...localReview,  // TextField 등 입력값
            rating: scope    // 사용자가 선택한 별점
        };
        axios.put(`http://localhost:8080/api/review/${review.reviewId}`, payload, {
            headers: {
                Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
            },
        })
            .then(res => {
                console.log('수정 성공', res.data)
                setChanged(true);
                setModal(false);
            }).catch(err => console.error('수정 실패', err));
    }

    const delReview = () => {//삭제
        axios.delete(`http://localhost:8080/api/review/${review.reviewId}`, {
            headers: {
                Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
            },
        })
            .then(res => {
                console.log('삭제 성공', res.data)
                setChanged(true);
                setModal(false);
            }).catch(err => console.error('삭제 실패', err));
    }

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
                <input type="hidden" value={assignedId}></input>
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
                            alt="profile"
                            src={`http://localhost:8080/api/public/driverImage/${driverImg}`}
                        />
                        <Typography sx={{ marginBottom: "10%" }}>{localReview.driverName}({localReview.carName})</Typography>
                        <Box width={"100%"} display={"flex"} justifyContent={"center"}>
                            <StarRate modifying={true} scope={scope} setScope={setScope} />
                        </Box>


                    </Box>

                </Box>
                <TextField name="reason" rows={15} multiline sx={{ width: "60%", margin: "5% 5% 0 0" }} value={localReview.reason ?? ""} onChange={writingReview}></TextField>
                <Box width={"60%"} display={"flex"} justifyContent={"center"} alignItems={"center"} margin={"5%"}>
                    <ButtonContainer width={"100%"}>
                        {localReview.reviewId == 0 ?
                            <One100ButtonAtCenter clickEvent={regiReview}>리뷰등록</One100ButtonAtCenter> :
                            <Two100Buttons
                                leftTitle={"리뷰 삭제"}
                                leftClickEvent={delReview}
                                rightTitle={"리뷰 수정"}
                                rightClickEvent={modiReview}

                                gap={3}
                            />
                        }
                    </ButtonContainer>


                </Box>

            </Box>
        </Modal>
    )
}

export default ReviewModal;