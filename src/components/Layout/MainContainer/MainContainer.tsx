

import React, { useState } from "react";
import ThemeSwitch from "@/components/ThemeSwitch/ThemeSwitch";
import styles from "./MainContainer.module.css";

function getCookieTheme(): string {
    if (typeof document === "undefined") return "theme1";
    const match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
    return match ? match[1] : "theme1";
}

export default function MainContainer({ children }: { children: React.ReactNode }) {
    const [currentTheme, setTheme] = useState(getCookieTheme);

    const setAndStoreTheme = (theme: string) => {
        setTheme(theme);
        document.documentElement.className = theme;
        document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}`;
        try {
            window.localStorage.setItem('theme', theme);
        } catch { /* storage full or unavailable */ }
    };

    return (
        <div className={styles.container}>
            {children}
            <ThemeSwitch
                setTheme={setAndStoreTheme}
                currentTheme={currentTheme}
            />
        </div>
    );
}
