import { Box } from "@mui/material";
import HistoryCalendar from "../../components/history/HistoryCalendar";
import { BGBox } from "../Payment/PaymentLayout"
import HistoryList from "../../components/history/HistoryList";
import { Outlet } from "react-router-dom";

const HistoryLayout = () => {
    return (
        <BGBox title={"이용기록"}>
            <Outlet/>
        </BGBox>

    )
}

export default HistoryLayout;