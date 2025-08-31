import { Typography } from "@mui/material"
import { theme } from "./CommonTheme"

export const CommonTitle=({children})=>{
    return(
        <Typography
            variant="h4"
            sx={{
                textAlign: "center",
                color: theme.palette.primary.main,
                fontWeight: "bold",
                margin: "5% 0" 
            }}
        >
            {children}
        </Typography>
    )
}

export function CommonSubTitle({ children }) {
    return (
        <Typography
            variant="h6"
            color={theme.palette.text.primary}
            width={"100%"}
            sx={{
                fontWeight: "bold",
            }}
        >
            {children}
        </Typography>
    )
}

export function CommonSmallerTitle({ children }) {
    return (
        <Typography
            variant="subtitle1"
            color={theme.palette.text.primary}
            width={"100%"}
            sx={{
                fontWeight: "bold",
            }}
        >
            {children}
        </Typography>
    )
}