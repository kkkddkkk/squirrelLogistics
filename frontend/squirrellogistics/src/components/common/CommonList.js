import { Paper, useTheme } from "@mui/material";

const CommonList = ({ clickEvent, children, padding, margin, sx }) => {
  const thisTheme = useTheme();
  return (
    <Paper
      onClick={clickEvent}
      sx={{
        margin: { margin },
        p: padding,
        mb: 2,
        border: "1px solid",
        borderColor: thisTheme.palette.text.secondary,
        boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: 1.5,
        fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
        cursor: clickEvent ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: clickEvent ? "translateY(-2px)" : "none",
          boxShadow: clickEvent
            ? "0px 8px 16px rgba(0, 0, 0, 0.15)"
            : "0px 5px 8px rgba(0, 0, 0, 0.1)",
          borderColor: clickEvent
            ? thisTheme.palette.primary.main
            : thisTheme.palette.text.primary,
        },
         ...sx,
      }}
    >
      {children}
    </Paper>
  );
};
export default CommonList;
