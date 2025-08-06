import { AppBar, Box, Button, Toolbar } from "@mui/material";
import logo from '../../pages/Driver/images/logo.jpg'
const DriverHeader_Temp = () => {

    return (
        <Box>
            <AppBar position="static" sx={{
                bgcolor: 'white',
                color: '#113f67',
                fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif'
            }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box component="img" src={logo} alt="logo" sx={{ height: 40 }} />
                    <Box sx={{ display: 'flex', justifyContent: "space-evenly", gap: 4 }}>
                        {['요청목록', '진행중 운송', '운송 기록', '캘린더', '나의정보', '신고하기'].map(menu => (
                            <Button key={menu} color="inherit" sx={{
                                fontFamily: 'inherit', fontSize: '1.1rem',
                                fontWeight: 'bold'
                            }}>{menu}</Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>

    );
}
export default DriverHeader_Temp;