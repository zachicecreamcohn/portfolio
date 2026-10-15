import React from "react";

import styles from "./About.module.css";
import TopContainer from "@/components/Layout/TopContainer/TopContainer";
import Image from "next/image";

export default function About() {
  return (
    <TopContainer>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.imageContainer}>
            <Image
              src={"/images/headshot.png"}
              alt={"Zach Cohn"}
              width={400}
              height={400}
              sizes="(max-width: 48rem) 100vw, 40vw"
              priority
            />
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.aboutContainer}>
            <h1>hello!</h1>
            <p>
              I&apos;m an NYC-based lighting and projections designer for live performance.
            </p>
            <p>
              I love combining art and technology in new and interesting ways.
              In addition to my design practice, I&apos;m also a software
              engineer and build custom tools that integrate with lighting and
              video systems to improve efficiency and expand production
              possibilities.
            </p>
          </div>
        </div>
      </div>
    </TopContainer>
  );
}
