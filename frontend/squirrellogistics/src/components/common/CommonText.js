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

export const FONT_SIZE_SMALL_TITLE = "clamp(13px, 1.5vw, 16px)";
export function CommonSmallerTitleMedia({ children }) {

    const thisTheme = useTheme();
    return (
        <Typography
            variant="subtitle1"
            color={thisTheme.palette.text.primary}
            fontSize={FONT_SIZE_SMALL_TITLE}
            width={"100%"}
            sx={{
                fontWeight: "bold",
            }}
        >
            {children}
        </Typography>
    )
}
