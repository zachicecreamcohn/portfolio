"use client";

import React from "react";
import styles from "./WorkPreview.module.css";
import Link from "next/link";

export default function WorkPreview({
  ImageSrc,
  Title,
  Description,
  Route,
}: {
  ImageSrc: string;
  Title: string;
  Description: string;
  Route: string;
}) {
  return (
    <div className={styles.container}>
      <Link href={Route} className={styles.imageContainer}>
        <img src={ImageSrc} alt={Title} loading="lazy" decoding="async" />
      </Link>
      <div className={styles.titleContainer}>
        <Link href={Route} className="link--headline">
          {Title}
        </Link>
      </div>
      <div className={styles.descriptionContainer}>
        <p>{Description}</p>
      </div>
    </div>
  );
}
