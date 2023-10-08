"use client"

import Button from "@/components/Button/Button";
import TopContainer from "@/components/Layout/TopContainer/TopContainer";
import styles from "./Home.module.css";
import Image from "next/image";
import Link from "next/link";
export default function Home() {

  return (
   <>

    <TopContainer>
        <div className={styles.heroContainer}>
            <div className={styles.hero}>
                <h1>im <span className={styles.name}>zach cohn</span>,</h1>
                <h1>
                    <span className={styles.color}>dev</span> and <span className={styles.color}>theatre artist</span></h1>
                <p>I&apos;m passionate about building full-stack, impactful applications and the ways emerging technologies interface with the arts.</p>

            <div className={styles.buttonContainer}>
                <Button content="Contact Me" style="primary" onClick={() => {}} />
                <a href="/work">
                <Button content="View Work" style="secondary" onClick={() => {}} />
                </a>
            </div>
            </div>

        </div>
        <Image src={"/images/hero.svg"} alt={"Vector artwork of Zach Cohn smiling"}
            className={styles.heroImage}
               width={500}
               height={500}

        />

    </TopContainer>
     </>
  )
}
