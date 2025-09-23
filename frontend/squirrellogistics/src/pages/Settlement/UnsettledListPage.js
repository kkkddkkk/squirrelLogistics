import { Grid } from "@mui/material";
import { CommonTitle } from "../../components/common/CommonText";
import UnsettledListComponent from "../../components/settlement/UnsettledListComponent";


export default function UnsettledListPage() {
    return (
        <>
            <CommonTitle>미정산 내역 관리</CommonTitle>
            <Grid container marginBottom={5} justifyContent={"center"} minHeight={"100vh"}>
                <Grid size={2} />
                <Grid size={8}>
                    <UnsettledListComponent />
                </Grid>
                <Grid size={2} />
            </Grid>
        </>

    );
}