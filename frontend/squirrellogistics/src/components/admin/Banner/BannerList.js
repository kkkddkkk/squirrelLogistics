import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import CommonList from "../../common/CommonList";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { OneButtonAtRight, TwoButtonsAtRight } from "../../common/CommonButton";
import { useEffect, useState } from "react";


const BannerList = ({ key, title, deleteFunc, showFunc, addFunc, isBanner,
    idx, showThumbnail, mobile }) => {
    const thisTheme = useTheme();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(mobile);
    }, [])

    const BannerContainer = ({ key, title, deleteFunc, showFunc }) => {
        return (
            <CommonList key={key} padding={2}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer"
                    }}
                >
                    <Box>
                        {title}
                    </Box>
                    <TwoButtonsAtRight
                        leftTitle={"삭제"}
                        leftClickEvent={deleteFunc}
                        leftColor={thisTheme.palette.error.main}

                        rightTitle={"수정"}
                        rightClickEvent={showFunc}
                        rightColor={thisTheme.palette.primary.main}

                        gap={1}
                    />
                </Box>
            </CommonList>
        )
    }
    const EmptyList = ({ addFunc }) => {
        return (
            <CommonList padding={2}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                    <Box color={thisTheme.palette.text.secondary}>
                        배너가 아직 {isMobile ? <br></br> : <></>}등록되지 않았습니다.
                    </Box>
                    <OneButtonAtRight
                        children={(isMobile ? "" : "배너") + " 추가"}
                        clickEvent={addFunc}
                        color={thisTheme.palette.primary.main}
                    />
                </Box>
            </CommonList>
        )
    }

    return (

        isBanner ?
            <BannerContainer
                key={key}
                title={title}
                deleteFunc={deleteFunc}
                showFunc={showFunc}
                idx={idx}
                showThumbnail={showThumbnail}
            /> :
            <EmptyList
                addFunc={addFunc}
            />

    )
}
export default BannerList;