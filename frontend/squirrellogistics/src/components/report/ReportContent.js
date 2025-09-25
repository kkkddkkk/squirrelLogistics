import { Box, Typography } from "@mui/material"
import { ListBoxContainer, SubTitle } from "../common/CommonForCompany"
import { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { CommonSmallerTitle, CommonSubTitle } from "../common/CommonText";

const ReportContent = ({ header, title, content, answer, preview, isMobile }) => {
    const [isExpand, setIsExpand] = useState(false);

    return (
        <ListBoxContainer header={header} isExpand={isExpand} setIsExpand={setIsExpand}>
            {!isExpand ? <></> :
            <Box margin={"3%"} width={"100%"}>
                <CommonSubTitle>{title}</CommonSubTitle> 
                <Typography textAlign={"justify"} marginTop={5}>{content}</Typography>
                {preview && preview.length > 0 ?
                    <Box width={"93%"} height={"200px"} display={"flex"} overflow={"auto"} margin={"5% 0"}>                                {
                        preview && preview.map((fileName, idx) => (
                            <img
                                key={idx}
                                src={`http://localhost:8080/api/public/reportImage/${fileName}`}
                                alt={`${fileName}`}
                                style={{ margin: "5px" }}
                            />
                        ))
                    }</Box> : <></>
                }
                <Box width={"93%"} border={"1px solid #909095"} margin={"5% 0"} />
                {isMobile?
                    <CommonSmallerTitle>'{title}'의 답변</CommonSmallerTitle>:
                    <CommonSubTitle>A. '{title}'의 답변</CommonSubTitle> 
                }
                <Typography textAlign={"justify"} marginTop={5}>
                    {answer}
                </Typography>
            </Box>

            }
        </ListBoxContainer>
    )
}
export default ReportContent;