"use client";

import Button from "@/components/Button/Button";
import TopContainer from "@/components/Layout/TopContainer/TopContainer";
import styles from "./Home.module.css";
import Image from "next/image";
import Link from "next/link";
import { Code } from "tabler-icons-react";
import React from "react";
import NavBar from "@/components/NavBar/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />

      <TopContainer>
        <div className={styles.heroContainer}>
          <div className={`col-xs-12 col-md-8 ${styles.left}`}>
            <div className={styles.hero}>
              <h1>
                im <span className={styles.name}>zach cohn</span>,
              </h1>
              <h1>
                <span className={styles.color}>dev</span> and{" "}
                <span className={styles.color}>theatre artist</span>
              </h1>
              <p>
                I do theatre, software, and sometimes both at the same time!
              </p>

              <div className={styles.buttonContainer}>
                <Link href={"/contact"} className={styles.contactButton}>
                  <Button style="primary" onClick={() => {}}>
                    Contact Me
                  </Button>
                </Link>
                <div>
                  <Link href={"/dev"}>
                    <Button style="secondary" onClick={() => {}}>
                      <Code size={24} strokeWidth={1.5} color={"#000000"} />
                    </Button>
                  </Link>
                  <Link href={"/design"}>
                    <Button style="secondary" onClick={() => {}}>
                      <Image
                        src={"/icons/stage-lights.svg"}
                        alt={"Theater and other work"}
                        width={24}
                        height={24}
                        className={styles["theater-icon"]}
                      />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className={`col-md-4 ${styles.right}`}>
            <Image
              src={"/images/hero.png"}
              alt={"png artwork of Zach Cohn smiling"}
              className={styles.heroImage}
              width={400}
              height={400}
            />
          </div>
        </div>
      </TopContainer>
    </>
  );
}
