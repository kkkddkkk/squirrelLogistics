import { Box, Grid, ListItem } from "@mui/material";
import HistoryCalendar from "../../components/history/HistoryCalendar";
import HistoryList from "../../components/history/HistoryList";
import { Layout } from "../../components/common/CommonForCompany";

const History = () => {
    return (
        <Layout title={"이용기록"}>
            <Grid container spacing={3}>
                <Grid size={6}>
                    <HistoryCalendar></HistoryCalendar>
                </Grid>
                <Grid size={6}>
                    <HistoryList></HistoryList>
                    <HistoryList></HistoryList>
                    <HistoryList></HistoryList>
                </Grid>
            </Grid>
        </Layout>

    )
}

export default History;