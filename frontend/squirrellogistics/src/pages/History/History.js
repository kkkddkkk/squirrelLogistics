import { Box, Grid, ListItem } from "@mui/material";
import HistoryCalendar from "../../components/history/HistoryCalendar";
import HistoryList from "../../components/history/HistoryList";

const HistoryLayout = () => {
    return (
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
    )
}

export default HistoryLayout;