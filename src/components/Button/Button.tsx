import React from "react";
import styles from "./Button.module.css";

export default function Button({content, onClick, style, className}: {content: string, onClick: () => void, style?: "primary" | "secondary", className?: string}) {
    return (
            <button onClick={onClick} className={styles.button + " " + (style === "primary" ? styles.primary : styles.secondary) + " " + className}>
                {content}
            </button>
    )

}