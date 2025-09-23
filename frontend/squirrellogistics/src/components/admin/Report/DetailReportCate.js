import { Grid, Typography, useTheme } from "@mui/material";
import { ListAlt, ThumbDown, Navigation, ReportProblem, DoNotDisturb, ChatBubbleOutline, Block, WarningAmber } from "@mui/icons-material";

import CommonList from "../../common/CommonList";

import ReportList from "./ReportList";
import { useState } from "react";
import { theme } from "../../common/CommonTheme";

const ReportPage = () => {
    const thisTheme = useTheme();
    const [keyword2, setKeyword2] = useState();

    const IconButton = ({ Icon, iconColor, clickEvent, status }) => {
        return (
            <Grid size={3}>
                <CommonList
                    padding={2}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        cursor: "pointer",
                        marginBottom: 0
                    }}
                    clickEvent={clickEvent}
                >
                    <Icon sx={{ color: iconColor, fontSize: 40, marginBottom: 1 }} />
                    <Typography sx={{ width: "100%", textAlign: "center" }}>{status}</Typography>
                </CommonList>
            </Grid>

        );
    }
    return (
        <>
            <Grid container spacing={3} marginBottom={5}>
                <IconButton
                    Icon={ListAlt}
                    iconColor={thisTheme.palette.primary.main}
                    status={`전체`}
                    clickEvent={() => setKeyword2(undefined)}
                />
                <IconButton
                    Icon={WarningAmber}
                    iconColor={theme.palette.error.main}
                    status={`긴급신고`}
                    clickEvent={() => setKeyword2('EMERGENCY')}
                />
                <IconButton
                    Icon={Block}
                    iconColor={theme.palette.error.light}
                    status={`부적절 운송`}
                    clickEvent={() => setKeyword2('INAPPROPRIATE')}
                />
                <IconButton
                    Icon={ChatBubbleOutline}
                    iconColor={theme.palette.warning.main}
                    status={`부적절 리뷰`}
                    clickEvent={() => setKeyword2('REVIEW')}
                />
                <IconButton
                    Icon={DoNotDisturb}
                    iconColor={theme.palette.success.main}
                    status={`미운송`}
                    clickEvent={() => setKeyword2('UNEXECUTED')}
                />
                <IconButton
                    Icon={ThumbDown}
                    iconColor={theme.palette.secondary.main}
                    status={`서비스`}
                    clickEvent={() => setKeyword2('SERVICE')}
                />
                <IconButton
                    Icon={Navigation}
                    iconColor={theme.palette.primary.main}
                    status={`경로이탈`}
                    clickEvent={() => setKeyword2('VEEROFCOURSE')}
                />
                <IconButton
                    Icon={ReportProblem}
                    iconColor={theme.palette.warning.dark}
                    status={`파손`}
                    clickEvent={() => setKeyword2('DAMAGE')}
                />
            </Grid>
            <ReportList cate={keyword2}></ReportList>
        </>
    );
}
export default ReportPage;