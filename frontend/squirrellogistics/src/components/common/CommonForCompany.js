import { Box, Button, Grid, Typography } from "@mui/material"
import { Outlet } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export const Title = ({ children }) => {
    return (
        <Typography
            variant="h6"
            component="p"
            sx={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2A2A2A',
                width: '100%',
                margin: '3%',
                lineHeight: 1.2,
                alignSelf: "flex-start"
            }}
        >
            {children}
        </Typography>
    )
}

export function SubTitle({ children }) {
    return (
        <Typography
            variant="h6"
            color="#2A2A2A"
            width={"100%"}
            marginBottom={"2%"}
        >
            {children}
        </Typography>
    )
}

export const Layout = ({ title, children }) => {
    return (
        <Box
            bgcolor={"#F5F7FA"}
            display="flex"
            width={"100%"}
            height={"100vh"}
            marginBottom={"2% 0"}
            flexWrap={"wrap"}
            minHeight={"100vh"}
            gap={0}
            flexDirection={"column"}
            justifyContent={"flex-start"}
            alignItems={"baseline"}
        >
            {title ? <Title>{title}</Title> : <></>}
            <div style={{ width: "100%", display: "flex", justifyContent: "center"}}>
                {children}
            </div>
        </Box>
    )
}

export const ListBoxContainer = ({ children, header, id, isExpand, setIsExpand }) => {
    const handleExpand = () => {
        if (!isExpand) setIsExpand(true);
        else setIsExpand(false);
    }

    return (
        <Box
            sx={{
                width: "90%",
                border: "1px solid #2A2A2A",
                borderRadius: "5px",
                padding: "7px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "2%"
            }}
        >
            <input type="hidden" value={id}></input>
            <Typography sx={{ margin: "2%" }}>{header}</Typography>
            {!isExpand ?
                <ExpandMoreIcon cursor={"pointer"} onClick={handleExpand} />
                :
                <>
                    <ExpandLessIcon cursor={"pointer"} onClick={handleExpand} />
                    <Grid sx={{ margin: "2%" }} size={12}>
                        {children}
                    </Grid>
                </>
            }
        </Box>
    )
}

//#region [버튼]
export const TwoBtns = ({ children1, children2, func1, func2 }) => {
    return (
        <Box>
            <Button
                variant="contained"
                sx={{ marginRight: "7px" }}
                onClick={func1}
            >
                {children1}
            </Button>
            <Button
                variant="contained"
                onClick={func2}
            >
                {children2}
            </Button>
        </Box>
    );
}

export const OneBigBtn = ({children, disabled, func, margin}) => {
    return (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Button
                variant="contained"
                sx={{ width: "60%", height: "50px", margin: {margin}, fontSize: "25px" }}
                onClick={func}
                disabled={disabled}
            >
                {children}
            </Button>
        </Box>
    )
}

//#endregion


