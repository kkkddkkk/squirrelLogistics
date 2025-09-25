import { useState } from "react";
import { ListBoxContainer, TwoBtns } from "../common/CommonForCompany";
import { Box, Divider, Typography } from "@mui/material";
import StarRate from "./StarRate";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReviewModal from "./ReviewModal";
import { TwoButtonsAtRight } from "../common/CommonButton";
import { theme } from "../common/CommonTheme";

const ReviewContent = ({ header, driverImg, driverName, reviewId, content, scope, setScope, delReviewFunc, modiReviewFunc, isMobile }) => {
    const [isExpand, setIsExpand] = useState(false);
    const [modal, setModal] = useState(false);
    const handleExpand = () => {
        if (!isExpand) setIsExpand(true);
        else setIsExpand(false);
    }

    return (
        <ListBoxContainer header={header} isExpand={isExpand} setIsExpand={setIsExpand}>
            {!isExpand ? <></>
                : <>
                    <input type="hidden" value={reviewId}></input>
                    <Box margin={"3%"} width={"94%"}>
                        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} >
                            <Box width={"30%"} display={"flex"} alignItems={"center"} flexWrap={"wrap"} flexDirection={"column"}>
                                <Box
                                    component="img"
                                    sx={{
                                        width: isMobile?"70%":"50%",
                                        aspectRatio: "1/1",
                                        borderRadius: "100%",
                                        marginBottom: "5%"
                                    }}
                                    alt="Img"
                                    src={driverImg}
                                />
                                <Typography sx={{ marginBottom: "10%" }}>{driverName}</Typography>

                            </Box>
                            <Box marginRight={"5%"}>
                                <StarRate scope={scope} setScope={setScope} size={isMobile?"30px":"50px"}></StarRate>
                            </Box>
                        </Box>

                        <Divider color={theme.palette.text.secondary}></Divider>
                        <Typography textAlign={"justify"} margin={"5% 0"}>
                            {content}
                        </Typography>
                        <TwoButtonsAtRight
                            leftTitle={"리뷰 삭제"}
                            leftClickEvent={delReviewFunc}
                            rightTitle={"리뷰 수정"}
                            rightClickEvent={modiReviewFunc}
                            gap={2}
                        />
                    </Box>
                </>
            }
        </ListBoxContainer>
    )
}
export default ReviewContent;