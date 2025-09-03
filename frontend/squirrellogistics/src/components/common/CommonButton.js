import { Box, Button, Grid, Typography } from "@mui/material"
import { theme } from "./CommonTheme";
import { lighten, useTheme } from "@mui/material/styles";
import { useState } from "react";


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
    const thisTheme = useTheme();
    const safeLeftColor = leftColor || thisTheme.palette.primary.main;
    const safeRightColor = rightColor || thisTheme.palette.primary.main;
    const safeMiddleColor = middleColor || thisTheme.palette.primary.main;
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

    const thisTheme = useTheme();
    const safeLeftColor = leftColor || thisTheme.palette.primary.main;
    const safeRightColor = rightColor || thisTheme.palette.primary.main;
    const safeMiddleColor = middleColor || thisTheme.palette.primary.main;
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
export const Two100Buttons = ({ leftTitle, rightTitle, leftClickEvent, rightClickEvent,
    leftDisabled, rightDisabled, leftColor, rightColor, gap }) => {

    const thisTheme = useTheme();
    const safeLeftColor = leftColor || thisTheme.palette.primary.main;
    const safeRightColor = rightColor || thisTheme.palette.primary.main;

    return (
        <Grid container spacing={gap}>
            <Grid size={6}>
                <Button
                    fullWidth
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
            <Grid size={6}>
                <Button
                    fullWidth
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

export const TwoButtonsAtCenter = ({ leftTitle, rightTitle, leftClickEvent, rightClickEvent,
    leftDisabled, rightDisabled, leftColor, rightColor }) => {

    const thisTheme = useTheme();

    const safeLeftColor = leftColor || thisTheme.palette.primary.main;
    const safeRightColor = rightColor || thisTheme.palette.primary.main;
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

    const thisTheme = useTheme();

    const safeLeftColor = leftColor || thisTheme.palette.primary.main;
    const safeRightColor = rightColor || thisTheme.palette.primary.main;

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

    const thisTheme = useTheme();

    const safeLeftColor = leftColor || thisTheme.palette.primary.main;
    const safeRightColor = rightColor || thisTheme.palette.primary.main;

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

    const thisTheme = useTheme();

    const safeLeftColor = leftColor || thisTheme.palette.primary.main;
    const safeRightColor = rightColor || thisTheme.palette.primary.main;

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

export const TwoToggleButton = ({ leftTitle, rightTitle, leftClickEvent, rightClickEvent,
    leftDisabled, rightDisabled, leftColor, rightColor, height }) => {

    const thisTheme = useTheme();

    const safeLeftColor = leftColor || thisTheme.palette.primary.main;
    const safeRightColor = rightColor || thisTheme.palette.primary.main;

    const [activated, setActivated] = useState("left");

    return (
        <Grid container>
            <Grid size={6}>
                <Button
                    fullWidth
                    variant="contained"

                    sx={{
                        borderRadius: 0,
                        backgroundColor: activated === "left" ? safeLeftColor : thisTheme.palette.background.default,
                        color: activated === "left" ? thisTheme.palette.background.default : thisTheme.palette.text.primary,
                        border: `1px solid ${thisTheme.palette.primary.main}`,
                        height: height
                    }}
                    onClick={() => {
                        setActivated("left");
                        leftClickEvent();
                    }}
                    disabled={leftDisabled}
                >
                    {leftTitle}
                </Button>
            </Grid>
            <Grid size={6}>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        borderRadius: 0,
                        backgroundColor: activated === "right" ? safeRightColor : thisTheme.palette.background.default,
                        color: activated === "right" ? thisTheme.palette.background.default : thisTheme.palette.text.primary,
                        border: `1px solid ${thisTheme.palette.primary.main}`,
                        height: height
                    }}
                    onClick={() => {
                        setActivated("right");
                        rightClickEvent();
                    }}
                    disabled={rightDisabled}
                >
                    {rightTitle}
                </Button>
            </Grid>
        </Grid>
    );
}
//#endRegion


//#region [oneButton]
export const One100ButtonAtCenter = ({ children, disabled, clickEvent, color, height, fontSize }) => {

    const thisTheme = useTheme();

    const safeColor = color || thisTheme.palette.primary.main;
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

    const thisTheme = useTheme();

    const safeColor = color || thisTheme.palette.primary.main;
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

    const thisTheme = useTheme();
    const safeColor = color || thisTheme.palette.primary.main;
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
    const thisTheme = useTheme();
    const safeColor = color || thisTheme.palette.primary.main;
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


