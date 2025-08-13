import { Box, Modal, TextField, Typography } from "@mui/material";
import StarRate from "./StarRate";
import { OneBigBtn, SubTitle, TwoBtns } from "../common/CommonForCompany";
import { useState } from "react";

const ReviewModal = ({ modal, setModal, scope, setScope, reviewId}) => {
    const regiReview=()=>{

        setModal(false);
    }

    const initState={
        reviewId:0,
        rating:0,
        reason:'',
        state:''
    }

    const [review, setReview] = useState(initState);
    const writingReview=(e=>{
        // review[e.target.]
    })

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
                        <Typography sx={{ marginBottom: "10%" }}>운전자명</Typography>
                        <Box width={"100%"} display={"flex"} justifyContent={"center"}>
                            <StarRate modifying={true} scope={scope} setScope={setScope} />
                        </Box>

                    </Box>

                </Box>
                <TextField rows={15} multiline sx={{ width: "60%", margin: "5% 5% 0 0"}} value={reviewId!=0?"수정중입니다":""} onclick={writingReview}></TextField>
                <Box width={"60%"} display={"flex"} justifyContent={"center"} alignItems={"center"} margin={"5%"}>
                    {reviewId==0?<OneBigBtn func={regiReview}>리뷰등록</OneBigBtn>:
                    <TwoBtns children1={"리뷰 삭제"} children2={"리뷰 수정"}></TwoBtns>}
                </Box>

            </Box>
        </Modal>
    )
}

export default ReviewModal;