import React from "react";

import styles from "./About.module.css";
import TopContainer from "@/components/Layout/TopContainer/TopContainer";
import Image from "next/image";
import NavBar from "@/components/NavBar/NavBar";

export default function About() {
  return (
    <>
      <NavBar />
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
          <div className={styles.right + " col-12 col-sm-7 col-lg-6"}>
            <div className={styles.aboutContainer}>
              <h1>hello!</h1>
              <p>
                I&apos;m an NYC-based lighting and projections designer for
                theatre.
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
    </>
  );
}
