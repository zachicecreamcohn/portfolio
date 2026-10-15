"use client";

import Button from "@/components/Button/Button";
import HeroBackdrop from "@/components/HeroBackdrop/HeroBackdrop";
import TopContainer from "@/components/Layout/TopContainer/TopContainer";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <>
      {/*
        Generative artwork behind the hero. Rendered as a sibling rather than a
        child of TopContainer so it never participates in that flex layout —
        it is `position: fixed`, so it takes no space either way, but this keeps
        the layout tree honest about what is in flow.

        It seeds itself from the text content of <main>, so the artwork is a
        function of this page's copy and nothing else.
      */}
      <HeroBackdrop />
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
            an NYC-based designer
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
    </>
  );
}
