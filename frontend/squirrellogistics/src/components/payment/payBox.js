import { Box, Divider, Grid, Typography } from "@mui/material";
import { paymentFormat, SubTitle } from "../common/CommonForCompany";
import CommonList from "../common/CommonList";
import { CommonSmallerTitle, CommonSubTitle } from "../common/CommonText";
import { theme } from "../common/CommonTheme";

//PayBox=({총금액 파라미터})로 Payment.js에 전달
const PayBox = ({ mileage, weight, baseRate, stopOver1, stopOver2, stopOver3, caution, mountainous, isAll,
    additionalRate, atPayment
}) => {

    const ContentBox = ({ children, subTitle }) => {
        return (
            <Grid container sx={{ border: "1px solid #2A2A2A", marginBottom: "5%" }}>
                <Grid item size={12} margin={"4% 0 0 4%"} >
                    <SubTitle>{subTitle}</SubTitle>
                </Grid>
                <Grid item size={12} margin={"0 4% 2% 4%"} display={"flex"} justifyContent={"space-between"} flexWrap={"wrap"}
                >
                    {children}
                </Grid>

            </Grid>
        )

    }

    const Content = ({ dataKey, value, locale }) => {

        function PforCharge({ children }) {
            return (
                <Typography
                    variant="body1"
                    component={"p"}
                    margin={"2%"}
                >
                    {children}
                </Typography>
            )
        }

        return (
            <>
                <PforCharge>{dataKey}</PforCharge>
                <PforCharge>{value}{locale ? "원" : ""}</PforCharge>
                <Divider color={theme.palette.text.secondary} />
            </>
        )
    }

    function HowMuch({ children, fontSize }) {
        return (
            <Box display={"flex"} justifyContent={"end"} marginTop={"4%"}>
                <Typography
                    sx={{
                        fontWeight: "bold",
                        fontSize: `${fontSize}px`,
                    }}
                >
                    {children}
                </Typography>
            </Box>
        )
    }

    return (
        <>
            <CommonList padding={2}>
                <CommonSmallerTitle>기본요금</CommonSmallerTitle>
                <Content dataKey={"주행거리"} value={`${paymentFormat(mileage)}km`} />
                <Content dataKey={"무게"} value={`${paymentFormat(weight)}kg`} />
                <HowMuch fontSize={20} inBox={true}>{paymentFormat(baseRate)}원</HowMuch>
            </CommonList>

            <CommonList padding={2}>
                <CommonSmallerTitle>추가요금</CommonSmallerTitle>
                {stopOver1 ? <Content dataKey={"경유지1"} value={paymentFormat(50000)} locale={true} /> : <></>}
                {stopOver2 ? <Content dataKey={"경유지2"} value={paymentFormat(50000)} locale={true} /> : <></>}
                {stopOver3 ? <Content dataKey={"경유지3"} value={paymentFormat(50000)} locale={true} /> : <></>}
                {caution ? <Content dataKey={"산간지역"} value={paymentFormat(50000)} locale={true} /> : <></>}
                {mountainous ? <Content dataKey={"취급주의"} value={paymentFormat(50000)} locale={true} /> : <></>}
                <HowMuch fontSize={20} inBox={true}>{paymentFormat(additionalRate)}원</HowMuch>
            </CommonList>

            <Box>
                <HowMuch fontSize={25}> {isAll ? '총' : ''}  {paymentFormat(baseRate + additionalRate)}원<span>&nbsp;</span>{atPayment && <span>&nbsp;</span>}</HowMuch>

            </Box>


        </>
    )
}

export default PayBox;