import { Box, Grid } from "@mui/material";
import SettlementDashboardComponent from "../../components/settlement/SettlementDashboardComponent";
import { CommonTitle } from "../../components/common/CommonText"; 
export default function SettlementDashboardPage({ onGoUnsettled }) {
    return (
        <>
            <CommonTitle>정산 대시보드</CommonTitle>
            <Grid container marginBottom={5} justifyContent={"center"} minHeight={"100vh"}>
                <Grid size={2} />
                <Grid size={8} >
                    <SettlementDashboardComponent onGoUnsettled={onGoUnsettled} />
                </Grid>
                <Grid size={2} />
            </Grid>
        </>

    );
}