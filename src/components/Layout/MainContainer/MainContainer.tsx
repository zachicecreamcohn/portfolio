import React, { useState, useEffect } from "react";
import ThemeSwitch from "@/components/ThemeSwitch/ThemeSwitch";
import styles from "./MainContainer.module.css";

export default function MainContainer({ children }: { children: React.ReactNode }) {
    console.log("init");
    const themes = [
        "theme1", "theme2", "theme3", "theme4"
    ];

    const [currentTheme, setTheme] = useState("theme1");

    useEffect(() => {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    const setAndStoreTheme = (theme: string) => {
        setTheme(theme);
        window.localStorage.setItem('theme', theme);
    };

    return (
        <div className={currentTheme + " " + styles.container}>
            {children}
            <ThemeSwitch
                setTheme={setAndStoreTheme}
                currentTheme={currentTheme}
            />
        </div>
    );
}
