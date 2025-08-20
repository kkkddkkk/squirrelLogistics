import { Grid, Typography } from "@mui/material";
import { paymentFormat, SubTitle } from "../common/CommonForCompany";

//PayBox=({총금액 파라미터})로 Payment.js에 전달
const PayBox = ({ mileage, weight, baseRate, stopOver1, stopOver2, stopOver3, caution, mountainous, isAll, 
    additionalRate
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

    const Content = ({ dataKey, value }) => {

        function PforCharge({ children }) {
            return (
                <Typography
                    variant="body1"
                    component={"p"}
                    color="#2A2A2A"
                    margin={"2%"}
                >
                    {children}
                </Typography>
            )
        }

        return (
            <>
                <PforCharge>{dataKey}</PforCharge>
                <PforCharge>{value}</PforCharge>
                <Grid size={12} borderBottom={"2px solid #909095"} />
            </>
        )
    }
    // let additionalRate = 0;
    // if (stopOver1) additionalRate += 50000;
    // if (stopOver2) additionalRate += 50000;
    // if (stopOver3) additionalRate += 50000;
    // if (caution) additionalRate += 50000;
    // if (mountainous) additionalRate += 50000;

    function HowMuch({ children, fontSize }) {
        return (
            <Grid size={12} display={"flex"} justifyContent={"end"} margin={"2%"}>
                <Typography
                    sx={{
                        color: "#2A2A2A",
                        fontWeight: "bold",
                        fontSize: `${fontSize}px`,
                    }}
                >
                    {children}
                </Typography>
            </Grid>
        )
    }



    return (
        <>
            <ContentBox subTitle={"기본요금"}>
                <Content dataKey={"주행거리"} value={`${paymentFormat(mileage)}km`} />
                <Content dataKey={"무게"} value={`${paymentFormat(weight)}kg`} />
                <HowMuch fontSize={20} inBox={true}>{paymentFormat(baseRate)}원</HowMuch>
            </ContentBox>

            <ContentBox subTitle={"추가요금"}>
                {stopOver1 ? <Content dataKey={"경유지1"} value={paymentFormat(50000)} /> : <></>}
                {stopOver2 ? <Content dataKey={"경유지2"} value={paymentFormat(50000)} /> : <></>}
                {stopOver3 ? <Content dataKey={"경유지3"} value={paymentFormat(50000)} /> : <></>}
                {caution ? <Content dataKey={"산간지역"} value={paymentFormat(50000)} /> : <></>}
                {mountainous ? <Content dataKey={"취급주의"} value={paymentFormat(50000)} /> : <></>}
                <HowMuch fontSize={20} inBox={true}>{paymentFormat(additionalRate)}원</HowMuch>
            </ContentBox>

            <HowMuch fontSize={25} topLine={true}> {isAll ? '총' : ''}  {paymentFormat(baseRate+additionalRate)}원</HowMuch>

        </>
    )
}

export default PayBox;