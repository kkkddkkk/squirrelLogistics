import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyThemeToCssVars, darkTheme, theme } from "./components/common/CommonTheme";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, GlobalStyles } from "@mui/material";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        return saved ? JSON.parse(saved) : false;
    });

    const toggleDarkMode  = () => {
        setDarkMode(prev => {
            localStorage.setItem("darkMode", JSON.stringify(!prev));
            return !prev;
        });
    }; 

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode  }}>
            <ThemeProvider theme={darkMode ? darkTheme : theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = () => useContext(DarkModeContext);