import { Box, Button, Grid, Typography } from "@mui/material"
import { theme } from "./CommonTheme";
import { lighten } from "@mui/material/styles";


//#region [버튼]

export const ButtonContainer = ({ children, width, marginTop, marginBottom }) => {
    return (
        <Box
            width={width}
            marginTop={marginTop}
            marginBottom={marginBottom}
        >
            {children}
        </Box>
    );
}

export const TwoButtonsAtCenter = ({ leftTitle, rightTitle, leftClickEvent, rightClickEvent,
    leftDisabled, rightDisabled, leftColor, rightColor }) => {

    const safeLeftColor = leftColor || theme.palette.primary.main;
    const safeRightColor = rightColor || theme.palette.primary.main;
    return (
        <Grid container>
            <Grid size={6} display={"flex"} justifyContent={"center"}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: safeLeftColor,
                        "&:hover": {
                            backgroundColor: lighten(safeLeftColor, 0.1), // 10% 밝게
                        },
                    }}
                    onClick={leftClickEvent}
                    disabled={leftDisabled}
                >
                    {leftTitle}
                </Button>
            </Grid>
            <Grid size={6} display={"flex"} justifyContent={"center"}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: safeRightColor,
                        "&:hover": {
                            backgroundColor: lighten(safeRightColor, 0.1), // 10% 밝게
                        },
                    }}
                    onClick={rightClickEvent}
                    disabled={rightDisabled}
                >
                    {rightTitle}
                </Button>
            </Grid>
        </Grid>
    );
}

export const TwoButtonsAtEnd = ({ leftTitle, rightTitle, leftClickEvent, rightClickEvent,
    leftDisabled, rightDisabled, leftColor, rightColor }) => {

    const safeLeftColor = leftColor || theme.palette.primary.main;
    const safeRightColor = rightColor || theme.palette.primary.main;

    return (
        <Grid container>
            <Grid size={6} display={"flex"} justifyContent={"-moz-initial"}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: safeLeftColor,
                        "&:hover": {
                            backgroundColor: lighten(safeLeftColor, 0.1), // 10% 밝게
                        },

                    }}
                    onClick={leftClickEvent}
                    disabled={leftDisabled}
                >
                    {leftTitle}
                </Button>
            </Grid>
            <Grid size={6} display={"flex"} justifyContent={"end"}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: safeRightColor,
                        "&:hover": {
                            backgroundColor: lighten(safeRightColor, 0.1), // 10% 밝게
                        },
                    }}
                    onClick={rightClickEvent}
                    disabled={rightDisabled}
                >
                    {rightTitle}
                </Button>
            </Grid>
        </Grid>
    );
}

export const One100ButtonAtCenter = ({ children, disabled, clickEvent, color, height, fontSize }) => {
    const safeColor = color || theme.palette.primary.main;
    return (
        <Grid container>
            <Grid size={12} display="flex" justifyContent="center">
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        width: "100%",
                        height: height,
                        fontSize: fontSize,
                        fontWeight: "bold",
                        backgroundColor: safeColor,
                        "&:hover": {
                            backgroundColor: lighten(safeColor, 0.1), // 10% 밝게
                        },

                    }}
                    onClick={clickEvent}
                    disabled={disabled}
                >
                    {children}
                </Button>
            </Grid>
        </Grid>

    )
}

export const OneButtonAtCenter = ({ children, disabled, clickEvent, color }) => {
    const safeColor = color || theme.palette.primary.main;
    return (
        <Grid container>
            <Grid size={12} display="flex" justifyContent="center">
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        backgroundColor: safeColor,
                        "&:hover": {
                            backgroundColor: lighten(safeColor, 0.1), // 10% 밝게
                        },
                    }}
                    onClick={clickEvent}
                    disabled={disabled}
                >
                    {children}
                </Button>
            </Grid>
        </Grid>

    )
}

export const OneButtonAtRight = ({ children, disabled, clickEvent, color }) => {
    const safeColor = color || theme.palette.primary.main;
    return (
        <Grid container>
            <Grid size={12} display="flex" justifyContent="end">
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        backgroundColor: safeColor,
                        "&:hover": {
                            backgroundColor: lighten(safeColor, 0.1), // 10% 밝게
                        },
                    }}
                    onClick={clickEvent}
                    disabled={disabled}
                >
                    {children}
                </Button>
            </Grid>
        </Grid>

    )
}

export const OneButtonAtLeft = ({ children, disabled, clickEvent, color }) => {
        const safeColor = color || theme.palette.primary.main;
    return (
        <Grid container>
            <Grid size={12} display="flex" justifyContent="-moz-initial">
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        backgroundColor: safeColor,
                        "&:hover": {
                            backgroundColor: lighten(safeColor, 0.1), // 10% 밝게
                        },
                    }}
                    onClick={clickEvent}
                    disabled={disabled}
                >
                    {children}
                </Button>
            </Grid>
        </Grid>

    )
}

//#endregion


