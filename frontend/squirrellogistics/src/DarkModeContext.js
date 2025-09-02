import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyThemeToCssVars, darkTheme, theme } from "./components/common/CommonTheme";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, GlobalStyles } from "@mui/material";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);
    console.log('DarkModeProvider 렌더링, darkMode:', darkMode);

    return (
        <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
            <ThemeProvider theme={darkMode ? darkTheme : theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = () => useContext(DarkModeContext);