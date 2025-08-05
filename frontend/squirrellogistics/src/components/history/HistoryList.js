import { Box, Button, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from "react";

const HistoryList = () => {
    const ListBox = ({ children }) => {
        return (
            <Box
                sx={{
                    width: "90%",
                    border: "1px solid #2A2A2A",
                    borderRadius: "5px",
                    padding: "7px",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap"
                }}
            >
                {children}
            </Box>
        )
    }

    const Buttons = ({ children, func }) => {
        return (
            <Button
                variant="contained"
                sx={{ marginRight: "7px" }}
                onClick={func}
            >
                {children}
            </Button>
        );
    }

    const [isExpand, setIsExpand] = useState(false);
    const [stopOver1, setStopOver1] = useState('');
    const [stopOver2, setStopOver2] = useState('');
    const [stopOver3, setStopOver3] = useState('');
    const [caution, setCaution] = useState(false);
    const [mountainous, setMountainous] = useState(false);

    const handleExpand = () => {
        //임시
        setStopOver1("1번 경유지입니다.");
        setMountainous(true);

        if (!isExpand) setIsExpand(true);
        else setIsExpand(false);
    }



    return (
        <ListBox>
            ooo-> 000
            {!isExpand ?
                <>
                    <ExpandMoreIcon cursor={"pointer"} onClick={handleExpand} />
                </> :
                <>
                    <ExpandLessIcon cursor={"pointer"} onClick={handleExpand} />
                    {stopOver1 ? <Box sx={{ width: "100%" }}>경유지1: {stopOver1}</Box> : <></>}
                    {stopOver2 ? <Box sx={{ width: "100%" }}>경유지2: {stopOver2}</Box> : <></>}
                    {stopOver3 ? <Box sx={{ width: "100%" }}>경유지3: {stopOver3}</Box> : <></>}

                    {caution ? <Box sx={{ width: "100%" }}><br />취급주의물품 포함</Box> : <></>}
                    {mountainous ? <Box sx={{ width: "100%" }}>{!caution ? <br /> : <></>}산간지역 포함</Box> : <></>}
                    <Box
                        sx={{
                            width: "100%", borderTop: "1px solid #909095", borderBottom: "1px solid #909095",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "8px 2px"
                        }}
                    >
                        <Box>
                            <Buttons>명세서</Buttons>
                            <Buttons>영수증</Buttons>
                        </Box>
                        <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}> 총 000 원</Typography>
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Box
                            component="img"
                            sx={{
                                height: "40px",
                                aspectRatio: "1/1",
                                marginTop: "2%"
                            }}
                            alt="OtterImg"
                            src="https://www.otterspecialistgroup.org/osg-newsite/wp-content/uploads/2017/04/ThinkstockPhotos-827261360-2000x1200.jpg"
                        />
                        <Typography sx={{display: "inline-block"}}>운전자명(차종)</Typography>
                    </Box>
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "end", marginBottom: "5px" }}>
                        <Buttons>신고</Buttons>
                        <Buttons>리뷰 작성</Buttons>
                    </Box>

                </>
            }
        </ListBox>
    )
}
export default HistoryList;