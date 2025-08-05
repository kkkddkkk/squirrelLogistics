import { Box } from "@mui/material";
import HistoryCalendar from "../../components/history/HistoryCalendar";
import { BGBox } from "../Payment/PaymentLayout"
import HistoryList from "../../components/history/HistoryList";
import { Outlet } from "react-router-dom";
import { TitleForCharge } from "../Payment/Payment";

const HistoryLayout = () => {
    return (
        <Box
            bgcolor={"#F5F7FA"}
            display="flex"
            justifyContent="space-between"
            width={"100%"}
            marginBottom={"2%"}
            flexWrap={"wrap"}
            minHeight={"100vh"}
            alignItems="flex-start"
            gap={0}
        >
            <TitleForCharge>이용기록</TitleForCharge>
            <Box width={"90%"} minWidth={"700px"}>
                <Outlet />
            </Box>
        </Box>


    )
}

export default HistoryLayout;