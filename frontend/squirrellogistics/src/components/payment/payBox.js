import { Box, Typography } from "@mui/material";
import { SubTitleForCharge } from "../../pages/Payment/Payment";

const PayBox = () => {
    function ContentBox({ children, width }) {
        return (
            <Box
                display={"flex"}
                justifyContent={"space-between"}
                borderBottom={2}
                borderColor={"#909095"}
                width={width}
            >
                {children}
            </Box>
        )
    }

    function PforCharge({ children }) {
        return (
            <Typography
                variant="body1"
                component={"p"}
                color="#2A2A2A"
                marginLeft={"2%"}
                marginRight={"2%"}
                marginBottom={"1%"}
            >
                {children}
            </Typography>
        )
    }

    function ChargeBox({ children }) {
        return (
            <Box
                display={"flex"}
                justifyContent={"center"}
                flexWrap={"wrap"}
                width={"100%"}
                border={1}
                borderColor={"#2A2A2A"}
                marginBottom={"10px"}
                paddingBottom={"20px"}
            >
                {children}
            </Box>
        )
    }

    function HowMuch({ children, fontSize, topLine, inBox }) {
        return (
            <Box

                sx={{
                    width: inBox ? "90%" : "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "end",
                    borderTop: topLine ? "2px solid #909095" : "none",
                    marginTop: !inBox ? "5%" : "2%",
                    paddingTop: !inBox ? "5%" : "0%",
                }}
            >
                <Typography
                    sx={{
                        color: "#2A2A2A",
                        fontWeight: "bold",
                        fontSize: `${fontSize}px`,
                        marginRight: '2%'
                    }}
                >
                    {children}
                </Typography>

            </Box>
        )

    }

    return (
        <>

            <ChargeBox>
                <SubTitleForCharge>기본요금</SubTitleForCharge>
                <ContentBox width={"90%"}>
                    <PforCharge>주행거리</PforCharge>
                    <PforCharge>00</PforCharge>
                </ContentBox>
                <ContentBox width={"90%"}>
                    <PforCharge>무&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;게</PforCharge>
                    <PforCharge>00</PforCharge>
                </ContentBox>
                <HowMuch fontSize={20} inBox={true}>00원</HowMuch>
            </ChargeBox>

            <ChargeBox>
                <SubTitleForCharge>추가요금</SubTitleForCharge>
                <ContentBox width={"90%"}>
                    <PforCharge>경유지1</PforCharge>
                    <PforCharge>00</PforCharge>
                </ContentBox>
                <ContentBox width={"90%"}>
                    <PforCharge>경유지2</PforCharge>
                    <PforCharge>00</PforCharge>
                </ContentBox>
                <ContentBox width={"90%"}>
                    <PforCharge>경유지3</PforCharge>
                    <PforCharge>00</PforCharge>
                </ContentBox>
                <ContentBox width={"90%"}>
                    <PforCharge>산간지역</PforCharge>
                    <PforCharge>00</PforCharge>
                </ContentBox>
                <ContentBox width={"90%"}>
                    <PforCharge>취급주의</PforCharge>
                    <PforCharge>00</PforCharge>
                </ContentBox>
                <ContentBox width={"90%"}>
                    <PforCharge>무&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;게</PforCharge>
                    <PforCharge>00</PforCharge>
                </ContentBox>
                <HowMuch fontSize={20} inBox={true}>00원</HowMuch>
            </ChargeBox>
            <HowMuch fontSize={25} topLine={true}>총 00원</HowMuch>

        </>

    )
}

export default PayBox;