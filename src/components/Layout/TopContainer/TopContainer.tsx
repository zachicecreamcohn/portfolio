import React from "react";
import styles from "./TopContainer.module.css";
export default function TopContainer({children}: {children: React.ReactNode}) {

    return (
        <div className={styles.container}>
            {children}
        </div>
    )
}