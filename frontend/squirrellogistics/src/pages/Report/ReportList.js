import { useState } from "react";
import { Layout, ListBoxContainer, SubTitle } from "../../components/common/CommonForCompany";
import { Box, Grid, Typography } from "@mui/material";
import ReportContent from "../../components/report/ReportContent";

const ReportList = () => {

    return (
        <Layout title={"내 신고목록"}>
            <Grid container>
                <Grid size={3} />
                <Grid size={6}>
                    <SubTitle>0000.00.00.</SubTitle>
                    <ReportContent
                        header={"id.start->id.end"}
                        title={"reportTitle"}
                        content={"reportContent"}
                        answer={"answer"}
                    ></ReportContent>
                </Grid>
                <Grid size={3} />
            </Grid>

        </Layout>
    )
}
export default ReportList;