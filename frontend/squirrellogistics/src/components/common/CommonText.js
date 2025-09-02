import { Typography, useTheme } from "@mui/material"
import { theme } from "./CommonTheme"

export const CommonTitle = ({ children }) => {

    const thisTheme = useTheme();
    return (
        <Typography
            variant="h4"
            sx={{
                textAlign: "center",
                color: thisTheme.palette.primary.main,
                fontWeight: "bold",
                margin: "3% 0"
            }}
        >
            {children}
        </Typography>
    )
}

export function CommonSubTitle({ children }) {

        const thisTheme = useTheme();
    return (
        <Typography
            variant="h6"
            color={thisTheme.palette.text.primary}
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

        const thisTheme = useTheme();
    return (
        <Typography
            variant="subtitle1"
            color={thisTheme.palette.text.primary}
            width={"100%"}
            sx={{
                fontWeight: "bold",
            }}
        >
            {children}
        </Typography>
    )
}