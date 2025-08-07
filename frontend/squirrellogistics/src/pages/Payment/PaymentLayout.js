import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TitleForCharge } from "./Payment";
import { Layout } from "../../components/common/CommonForCompany";

export function BGBox({ children, title }) {
    return (
        <Box
            bgcolor={"#F5F7FA"}
            display="flex"
            justifyContent="center"
            width={"100%"}
            marginBottom={"2%"}
            flexWrap={"wrap"}
            minHeight={"100vh"}
        >
            {children}
        </Box>
    )
}

const PaymentLayout = () => {
    return (
        <Layout title={"결제"}></Layout>
    )
}
export default PaymentLayout;