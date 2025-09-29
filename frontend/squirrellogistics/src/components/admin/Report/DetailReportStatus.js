import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
    PendingActions,
    Search,
    TaskAlt,
    ListAlt
} from "@mui/icons-material";
import CommonList from "../../common/CommonList";

import ReportList from "./ReportList";
import { useState } from "react";

const ReportPage = () => {
    const thisTheme = useTheme();
    const isMobile = useMediaQuery(thisTheme.breakpoints.down('sm'));
    const [keyword2, setKeyword2] = useState();

    const IconButton = ({ Icon, iconColor, clickEvent, status }) => {
        return (
            <Grid size={isMobile?6:3}>
                <CommonList
                    padding={isMobile?1:2}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        cursor: "pointer",
                        marginBottom: isMobile?'0 !important':''
                    }}
                    clickEvent={clickEvent}
                >
                    <Icon sx={{ color: iconColor, fontSize: isMobile?20:40, marginBottom: 1 }} />
                    <Typography sx={{ width: "100%", textAlign: "center" }}>{status}</Typography>
                </CommonList>
            </Grid>

        );
    }

    return (
        <>
            <Grid container spacing={isMobile?1:3} marginBottom={isMobile?"10%":""}>
                <IconButton
                    Icon={ListAlt}
                    iconColor={thisTheme.palette.primary.main}
                    status={`전체`}
                    clickEvent={() => setKeyword2(undefined)}
                />
                <IconButton
                    Icon={PendingActions}
                    iconColor={thisTheme.palette.error.main}
                    status={`미확인`}
                    clickEvent={() => setKeyword2('PENDING')}
                />
                <IconButton
                    Icon={Search}
                    iconColor={thisTheme.palette.warning.main}
                    status={`검토 중`}
                    clickEvent={() => setKeyword2('IN_REVIEW')}
                />
                <IconButton
                    Icon={TaskAlt}
                    iconColor={thisTheme.palette.success.main}
                    status={`답변 완료`}
                    clickEvent={() => setKeyword2('ACTION_TAKEN')}
                />
            </Grid>
            <ReportList status={keyword2}></ReportList>
        </>
    );
}
export default ReportPage;