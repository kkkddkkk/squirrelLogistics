import { Box, Grid, useTheme } from "@mui/material";
import CommonList from "../../common/CommonList";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { OneButtonAtRight, TwoButtonsAtRight } from "../../common/CommonButton";


const BannerList = ({ key, title, deleteFunc, showFunc, addFunc, isBanner, idx, showThumbnail }) => {
    const thisTheme = useTheme();

    const BannerContainer = ({ key, title, deleteFunc, showFunc, showThumbnail }) => {
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
            <Grid container spacing={1} onClick={showThumbnail}>
                <Grid size={1} >
                    <CommonList padding={2} sx={{
                        display: "flex",
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: "column",
                        boxSizing: "border-box",
                        height: "calc(100% - 16px)",
                    }}>
                        <PostAddIcon sx={{ color: thisTheme.palette.text.secondary }} />

                    </CommonList>
                </Grid>
                <Grid size={11}>
                    <CommonList padding={2}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                            <Box color={thisTheme.palette.text.secondary}>
                                배너가 아직 등록되지 않았습니다.
                            </Box>
                            <OneButtonAtRight
                                children={"배너 추가"}
                                clickEvent={addFunc}
                                color={thisTheme.palette.primary.main}
                            />
                        </Box>
                    </CommonList>
                </Grid>
            </Grid>


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