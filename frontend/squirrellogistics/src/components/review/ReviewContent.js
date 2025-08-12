import { useState } from "react";
import { ListBoxContainer, TwoBtns } from "../common/CommonForCompany";
import { Box, Typography } from "@mui/material";
import StarRate from "./StarRate";

const ReviewContent = ({ header, driverImg, driverName, content, setModal }) => {
    const [isExpand, setIsExpand] = useState();
    const [scope, setScope] = useState();
    return (
        <ListBoxContainer isExpand={isExpand} setIsExpand={setIsExpand} header={header}>
            <Box margin={"3%"}>
                <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} >
                    <Box width={"30%"} display={"flex"} alignItems={"center"} flexWrap={"wrap"} flexDirection={"column"}>
                        <Box
                            component="img"
                            sx={{
                                width: "50%",
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
                        <StarRate scope={scope} setScope={setScope} size={"50px"}></StarRate>
                    </Box>

                </Box>


                <Box width={"100%"} border={"1px solid #909095"} margin={"5% 0"} />
                <Typography textAlign={"justify"}>
                    {content}
                </Typography>
                <Box width={"100%"} display={"flex"} justifyContent={"end"} marginTop={"5%"}>
                    <TwoBtns children1={"리뷰 삭제"} func1={() => alert("리뷰 삭제")} children2={"리뷰 수정"} func2={() => setModal(true)}></TwoBtns>
                </Box>
            </Box>
        </ListBoxContainer>
    )
}
export default ReviewContent;