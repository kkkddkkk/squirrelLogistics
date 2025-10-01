import { Box, Grid, useMediaQuery } from "@mui/material";
import SettlementDashboardComponent from "../../components/settlement/SettlementDashboardComponent";
import { CommonTitle } from "../../components/common/CommonText";
import { theme } from "../../components/common/CommonTheme";
export default function SettlementDashboardPage({ onGoUnsettled }) {
    const isSmaller900 = useMediaQuery(theme.breakpoints.down('md'));


    return (
        <>
            <CommonTitle>정산 대시보드</CommonTitle>
            <Grid container mt={isSmaller900 ? 3 : 0} marginBottom={5} justifyContent={"center"} minHeight={"100vh"}>
                <Grid size={isSmaller900 ? 1 : 2} />
                <Grid size={isSmaller900 ? 10 : 8} >
                    <SettlementDashboardComponent onGoUnsettled={onGoUnsettled} />
                </Grid>
                <Grid size={isSmaller900 ? 1 : 2} />
            </Grid>
        </>

    );
}