import React from "react";
import Link from "next/link";
import styles from "./Art.module.css";
import WorkPreview from "@/components/WorkPreview/WorkPreview";
import dbData from "../../../public/data/db.json";
import { Project } from "@/Types";

export default function Page() {
  const works = dbData.work.filter((work: Project) => !work.hidden);

  return (
    <div className={styles.container}>
      <p className={styles.cvLink}>
        For a full list of work, see{" "}
        <Link
          href="/resume/lighting-projections.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="animate-hover"
        >
          my CV
        </Link>
      </p>

      {/*
        Previously this rendered 8 additional invisible <WorkPreview hidden>
        cards purely to influence flex-wrap line breaking. The grid below does
        it natively, so the hidden prop and those elements are gone.
      */}
      <div className={styles.works}>
        {works.map((work: Project, index: number) => {
          const thumbImage = work.images.find((image) => image.isThumb);
          return (
            <WorkPreview
              key={work.link || index}
              ImageSrc={thumbImage ? thumbImage.src : ""}
              Title={work.previewTitle}
              Description={work.blurb}
              Route={work.link}
            />
          );
        })}
      </div>
    </div>
  );
}
