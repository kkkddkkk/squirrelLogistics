import { Box, Typography } from "@mui/material";
import ActualMap from "../../components/actualCalc/ActualMap";
import PayBox from "../../components/payment/payBox";
import RemoveIcon from '@mui/icons-material/Remove';
import { Buttons } from "../../components/history/HistoryList";
import HelpIcon from '@mui/icons-material/Help';

const ActualCalc = () => {

    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignContent: "center"
            }}
        >
            <Box sx={{ width: "45%" }}>
                <ActualMap></ActualMap>
            </Box>
            <Box sx={{ width: "45%" }}>
                <PayBox all={true}></PayBox>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "5%",
                        paddingBottom: "5%",
                        borderBottom: "2px solid #909095"
                    }}
                >
                    <RemoveIcon />
                    <Typography
                        sx={{
                            color: "#2A2A2A",
                            fontWeight: "bold",
                            fontSize: `25px`,
                            marginRight: '2%',
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <HelpIcon cursor={"pointer"}/>&nbsp;
                        00원
                       
                    </Typography>
                     
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "end",
                    }}
                >
                    <Typography
                        sx={{
                            color: "#2A2A2A",
                            fontWeight: "bold",
                            fontSize: `25px`,
                            marginRight: '2%'
                        }}
                    >
                        총 000원
                    </Typography>

                </Box>
                <Box sx={{ width: "100%", display: "flex", justifyContent: "end", margin: "5% 0" }}>
                    <Buttons>신고</Buttons>
                    <Buttons>명세서</Buttons>
                    <Buttons >정 산</Buttons>
                </Box>
            </Box>

        </Box>

    )
}

export default ActualCalc;