import { Box, Button, Grid, Typography } from "@mui/material";
import logo from '../../pages/Driver/images/logo.jpg'
import { useNavigate, useParams } from "react-router-dom";

const EmptyDeliveryTrackingComponent = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    
    const onClickMove = () => {
        navigate(`/driver/${driverId}/list`);
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width={"100%"}
        >
            <Grid width={"100%"}
                sx={{
                    background: "linear-gradient(to bottom, #58a1c85d 0%, white 100%)",
                    minHeight: 190
                }}
            >
            </Grid>
            <img src={logo} alt="logo" style={{ maxWidth: "240px", marginBottom: "20px" }} />
            <Typography variant="h6"
                color='#2A2A2A'
                fontSize='clamp(14px, 1.5vw, 16px)'
                textAlign={"center"}
                fontWeight={"bold"}
                lineHeight={1.6}
                gutterBottom>
                현재 진행 중인 운송 내역이 없습니다.<br />지금 운송 요청 목록을 확인하러 가시겠습니까?
            </Typography>
            <Button variant="contained" color="primary" fontSize='clamp(14px, 1.5vw, 16px)' onClick={onClickMove} sx={{ mt: 2, backgroundColor:'#113F67'}}>
                운송 목록으로 가기
            </Button>
        </Box>
    );

};
export default EmptyDeliveryTrackingComponent;