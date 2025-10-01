import { Grid, useMediaQuery } from "@mui/material";
import { CommonTitle } from "../../components/common/CommonText";
import UnsettledListComponent from "../../components/settlement/UnsettledListComponent";
import { theme } from "../../components/common/CommonTheme";


export default function UnsettledListPage() {
    const isSmaller900 = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <>
            <CommonTitle>미정산 내역 관리</CommonTitle>
            <Grid container marginBottom={5} justifyContent={"center"} minHeight={"100vh"}>
                <Grid size={isSmaller900 ? 1 : 2} />
                <Grid size={isSmaller900 ? 10 : 8}>
                    <UnsettledListComponent />
                </Grid>
                <Grid size={isSmaller900 ? 1 : 2} />
            </Grid>
        </>

    );
}