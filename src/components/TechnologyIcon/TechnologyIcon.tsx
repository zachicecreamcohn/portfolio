import React from 'react';
import styles from "./TechnologyIcon.module.css";

interface TechnologyIconProps {
    children: React.ReactNode;
    labelText: string;
    spacer?: boolean;
}

export default function TechnologyIcon({ children, labelText, spacer }: TechnologyIconProps) {
    return (
        <div className={styles.container + (spacer ? " " + styles.spacer : "")}>
            <div className={styles.icon}>
                {children}
            </div>
            <div className={styles.labelContainer}>
                <span className={styles.labelText}>{labelText}</span>
            </div>
        </div>
    );
}
