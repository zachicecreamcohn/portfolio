"use client"

import React from "react";
import styles from "./WorkPreview.module.css";
import Link from "next/link";
import Image from "next/image";

export default function WorkPreview({ImageSrc, Title, Description, Route, hidden}: {
    ImageSrc: string,
    Title: string,
    Description: string,
    Route: string,
    hidden?: boolean
}) {


    return (
        <div className={styles.container + " " + (hidden ? styles.hidden : "")}>
            <Link href={Route} legacyBehavior>
                <a className={styles.imageContainer}>
                    <img src={ImageSrc} alt={Title} width={500} height={500}/>
                </a>
            </Link>
            <div className={styles.titleContainer}>
                <Link href={Route} className={"animate-hover"}>{Title}</Link>
            </div>
            <div className={styles.descriptionContainer}>
                <p>{Description}</p>
            </div>
        </div>
    )
}