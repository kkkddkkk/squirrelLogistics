import { Box, Button, Grid, Typography } from "@mui/material"
import { theme } from "./CommonTheme";
import { lighten } from "@mui/material/styles";


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
//#region[ThreeButtons]
export const Three100Buttons = ({ leftTitle, rightTitle, middleTitle, leftClickEvent, rightClickEvent, middleClickEvent,
    leftDisabled, rightDisabled, middleDisabled, leftColor, rightColor, middleColor, gap }) => {

    const safeLeftColor = leftColor || theme.palette.primary.main;
    const safeRightColor = rightColor || theme.palette.primary.main;
    const safeMiddleColor = middleColor || theme.palette.primary.main;
    return (
        <Box display={"flex"} justifyContent={"center"} gap={gap}>
            <Button
                variant="contained"
                sx={{
                    width: "33%",
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

            <Button
                variant="contained"
                sx={{
                    width: "33%",
                    backgroundColor: safeMiddleColor,
                    "&:hover": {
                        backgroundColor: lighten(safeMiddleColor, 0.1), // 10% 밝게
                    },
                }}
                onClick={middleClickEvent}
                disabled={middleDisabled}
            >
                {middleTitle}
            </Button>

            <Button
                variant="contained"
                sx={{
                    width: "33%",
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
        </Box>
    );
}

export const ThreeButtons = ({ leftTitle, rightTitle, middleTitle, leftClickEvent, rightClickEvent, middleClickEvent,
    leftDisabled, rightDisabled, middleDisabled, leftColor, rightColor, middleColor, gap }) => {

    const safeLeftColor = leftColor || theme.palette.primary.main;
    const safeRightColor = rightColor || theme.palette.primary.main;
    const safeMiddleColor = middleColor || theme.palette.primary.main;
    return (
        <Box display={"flex"} justifyContent={"center"} gap={gap}>
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

            <Button
                variant="contained"
                sx={{
                    backgroundColor: safeMiddleColor,
                    "&:hover": {
                        backgroundColor: lighten(safeMiddleColor, 0.1), // 10% 밝게
                    },
                }}
                onClick={middleClickEvent}
                disabled={middleDisabled}
            >
                {middleTitle}
            </Button>

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
        </Box>
    );
}


//#region [twoButtons]
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

export const TwoButtonsAtRight = ({ leftTitle, rightTitle, leftClickEvent, rightClickEvent,
    leftDisabled, rightDisabled, leftColor, rightColor, gap }) => {

    const safeLeftColor = leftColor || theme.palette.primary.main;
    const safeRightColor = rightColor || theme.palette.primary.main;

    return (
        <Box display={"flex"} justifyContent={"end"} gap={gap}>
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
        </Box>
    );
}

export const TwoButtonsAtLeft = ({ leftTitle, rightTitle, leftClickEvent, rightClickEvent,
    leftDisabled, rightDisabled, leftColor, rightColor, gap }) => {

    const safeLeftColor = leftColor || theme.palette.primary.main;
    const safeRightColor = rightColor || theme.palette.primary.main;

    return (
        <Box display={"flex"} justifyContent={"-moz-initial"} gap={gap}>
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
        </Box>
    );
}
//#endRegion


//#region [oneButton]
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


