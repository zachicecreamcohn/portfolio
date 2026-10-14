"use client";

import Button from "@/components/Button/Button";
import TopContainer from "@/components/Layout/TopContainer/TopContainer";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <TopContainer>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          im <span className={styles.name}>zach cohn</span>,
        </h1>
        <h1 className={styles.title}>
          <span className={styles.color}>lighting </span>
          and <span className={styles.color}>projections designer</span>
        </h1>
        <p className={styles.intro}>
          an NYC-based designer for theatre and dance
        </p>

        <div className={styles.buttonContainer}>
          <Button href="/contact" variant="primary">
            Contact Me
          </Button>
          <Button href="/design" variant="secondary">
            My Work
          </Button>
        </div>
      </div>
    </TopContainer>
  );
}
