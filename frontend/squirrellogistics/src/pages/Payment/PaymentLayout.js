import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TitleForCharge } from "./Payment";

export function BGBox({ children, title }) {
    return (
        <Box
            bgcolor={"#F5F7FA"}
            display="flex"
            justifyContent="center"
            width={"100%"}
            marginBottom={"2%"}
            flexWrap={"wrap"}
        >
            <TitleForCharge>{title}</TitleForCharge>
            <Box width={"60%"} maxWidth={"700px"}>
                {children}
            </Box>
        </Box>
    )
}

const PaymentLayout = () => {
    return (
        <BGBox title={"결제"}>
            <Outlet></Outlet>
        </BGBox>
    )
}
export default PaymentLayout;