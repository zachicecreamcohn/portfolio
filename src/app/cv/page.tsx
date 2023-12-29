'use client'

import React from "react";
import { saveAs } from "file-saver";
import styles from "./cv.module.css"
import Link from "next/link";
import NavBar from "@/components/NavBar/NavBar";
export default function cv() {

    const downloadSoftware = () => {
        saveAs("/cvs/software.pdf", "Zach Cohn CV - Standard.pdf");
    }

    const downloadTheatre = () => {
        saveAs("/cvs/theatre.pdf", "Zach Cohn CV - Theatre.pdf");
    }
    return (
        <>
        <NavBar/>

        <div className={styles.cv}>
            <h1>Choose a CV</h1>
            <div className={styles.cvsContainer + " row"}>
                <div className={styles.cvContainer + " col-12 col-md-6 d-flex"}>
                    <h2>Software Engineering</h2>
                    <p>A resume focusing on my experience as a developer</p>
                    <Link onClick={downloadSoftware} href={"#"} className={"animate-hover"}>Download</Link>
                </div>
                <div className={styles.cvContainer + " col-12 col-md-6 d-flex"}>
                    <h2>Theatre</h2>
                    <p>Design, technical, and directorial production roles</p>
                    <Link onClick={downloadTheatre} href={"#"} className={"animate-hover"}>Download</Link>
                </div>
            </div>
        </div>
        </>
    )
}