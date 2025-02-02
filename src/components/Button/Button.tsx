import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    style?: "primary" | "secondary";
    className?: string;
    [x: string]: any; // This allows the component to accept any other props.
}

export default function Button({children, onClick, style, className, ...restProps}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`${styles.button} ${style === "primary" ? styles.primary : styles.secondary} ${className || ""}`}
            {...restProps} // Spread any other props onto the button.
        >
            {children}
        </button>
    );

}
