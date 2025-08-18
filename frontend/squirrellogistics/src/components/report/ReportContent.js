import { Box, Typography } from "@mui/material"
import { ListBoxContainer, SubTitle } from "../common/CommonForCompany"
import { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const ReportContent = ({ header, title, content, answer, preview }) => {
    const [isExpand, setIsExpand] = useState();

    const handleExpand = () => {
        if (!isExpand) setIsExpand(true);
        else setIsExpand(false);
    }

    return (
        <ListBoxContainer header={header}>
            {!isExpand ?
                <ExpandMoreIcon cursor={"pointer"} onClick={handleExpand} />
                : <>
                    <ExpandLessIcon cursor={"pointer"} onClick={handleExpand} />
                    <Box margin={"3%"} width={"100%"}>
                        <SubTitle>{title} </SubTitle>
                        <Typography textAlign={"justify"}>{content}</Typography>
                        {preview &&preview.length > 0 ?
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
                        <SubTitle>A. {title}의 답변</SubTitle>
                        <Typography textAlign={"justify"}>
                            {answer}
                        </Typography>
                    </Box>
                </>
            }

        </ListBoxContainer>
    )
}
export default ReportContent;