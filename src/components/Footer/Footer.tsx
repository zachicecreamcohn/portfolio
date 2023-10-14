import styles from "./Footer.module.css"

import {BrandLinkedin, BrandGithub} from "tabler-icons-react";
import head from "next/head";
import React from "react";

export default function Footer() {
    return (
        <div className={styles.container}>
            <head>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css"/>
            </head>
           <div className={styles.iconsContainer}>
               <a href="https://github.com/zachicecreamcohn" className="m-0 p-0" target="_blank">
                   <i className={`devicon-github-plain footer-icon colored ${styles.icon}`}></i>
               </a>
               <a href="https://www.linkedin.com/in/zcohn/" className="m-0 p-0" target="_blank">
                   <i className={`devicon-linkedin-plain footer-icon colored ${styles.icon}`}></i>
               </a>           </div>
        </div>
    )
}