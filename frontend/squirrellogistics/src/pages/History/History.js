import { Box } from "@mui/material";
import HistoryCalendar from "../../components/history/HistoryCalendar";
import HistoryList from "../../components/history/HistoryList";

const HistoryLayout = () => {
    return (
        <Box
            sx={{
                width: "90%",
                display: "flex",
                justifyContent: "space-between",
                alignContent: "center"
            }}
        >
            <Box sx={{ width: "50%"}}>
                <HistoryCalendar></HistoryCalendar>
            </Box>
            <Box sx={{ width: "50%"}}>
                <HistoryList></HistoryList>
            </Box>

        </Box>

    )
}

export default HistoryLayout;