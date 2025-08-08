import { AppBar, Box, Button, Toolbar } from "@mui/material";
import logo from '../../pages/Driver/images/logo.jpg'
import { useNavigate } from "react-router-dom";
const DriverHeader_Temp = () => {

    const driverId = 1;
    const navigate = useNavigate();

    const menuItems = [
        { path: "/driver/list", label: "요청 목록" },
        { path: `/driver/ongoing/${driverId}`, label: "진행 중 운송" },
        { path: `/driver/calendar/${driverId}`, label: "캘린더" },
        { path: `/driver/delivered`, label: "운송 목록" },
        { path: "/driver/profile", label: "나의 정보" },
    ];

    const handleClick = (path) => {
        navigate(path);
    };
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
                        {menuItems.map((item, index) => (
                            <Button key={index} color="inherit"
                                onClick={() => handleClick(item.path)}
                                sx={{
                                    fontFamily: 'inherit', fontSize: '1.1rem',
                                    fontWeight: 'bold'
                                }}>{item.label}</Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>

    );
}
export default DriverHeader_Temp;