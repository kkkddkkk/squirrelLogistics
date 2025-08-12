import { Box, Typography } from "@mui/material"
import { ListBoxContainer, SubTitle } from "../common/CommonForCompany"
import { useState } from "react";

const ReportContent = ({ header, title, content, answer }) => {
    const [isExpand, setIsExpand] = useState();

    return (
        <ListBoxContainer isExpand={isExpand} setIsExpand={setIsExpand} header={header}>
            <Box margin={"3%"}>
                <SubTitle>{title} </SubTitle>
                <Typography textAlign={"justify"}>{content}</Typography>
                <Box width={"100%"} border={"1px solid #909095"} margin={"5% 0"} />
                <SubTitle>A. {title}의 답변</SubTitle>
                <Typography textAlign={"justify"}>
                    {answer}
                </Typography>
            </Box>

        </ListBoxContainer>
    )
}
export default ReportContent;