import React from "react";

import styles from "./About.module.css";
import TopContainer from "@/components/Layout/TopContainer/TopContainer";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/Footer/Footer";

export default function About() {

    return (
        <>
            <NavBar/>
            <TopContainer>
                <div className={styles.container + " container"}>

                        <div className={styles.left}>
                            <div className={styles.imageContainer}>
                                <Image
                                    src={"/images/headshot.png"}
                                    alt={"Zach Cohn"}
                                    layout="responsive"
                                    width={400}
                                    height={400}
                                />
                            </div>
                        </div>
                        {/*<div className="d-none d-sm-block col-1  col-lg-2"></div>*/}
                        <div className={styles.right + " col-12 col-sm-7 col-lg-6"}>
                            <div className={styles.aboutContainer}>
                                <h1>hello!</h1>

                                <p>My name is Zach Cohn, and I&apos;m a developer and theatre maker from NYC.</p>
                                <p>I&apos;m currently studying Drama and Computer Science at Washington University in
                                    St.
                                    Louis.</p>
                                <p>I love to explore the intersection of technology and art, especially projection
                                    mapping,
                                    theatrical lighting, and performance automation. I&apos;m also an avid cyclist.</p>
                                <div className={styles.cvContainer}>
                                    <Link href={"/cv"} className={"animate-hover"}>Download CV</Link>
                                </div>
                            </div>
                        </div>
                </div>
            </TopContainer>
        </>
    )
}