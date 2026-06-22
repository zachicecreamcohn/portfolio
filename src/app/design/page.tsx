import React from "react";
import Link from "next/link";
import styles from "./Art.module.css";
import WorkPreview from "@/components/WorkPreview/WorkPreview";
import { root } from "postcss";
import Navbar from "@/components/NavBar/NavBar";
import dbData from "../../../public/data/db.json";
import { Project } from "@/Types";

export default async function Page({ params }: { params: { slug: string } }) {
  // open db.json and get all the projects
  // for each project, render a WorkPreview component

  const works_data = dbData.work;

  return (
    <>
      <Navbar />
      <div className={styles.cvLink}>
        For a full list of work, see <Link href="/resume/lighting-projections.pdf" target="_blank" rel="noopener noreferrer" className="animate-hover">my CV</Link>
      </div>

      <div className={styles.container}>
        <div className={styles.works}>
          {works_data.map((work: Project, index: number) => {
            const thumbImage = work.images.find((image) => image.isThumb);
            let imageSrc = thumbImage ? `${thumbImage.src}` : "";

            if (work.hidden) {
              return <></>;
            }
            return (
              <WorkPreview
                key={index}
                ImageSrc={imageSrc}
                Title={work.previewTitle}
                Description={work.blurb}
                Route={work.link}
              />
            );
          })}

          {Array(8)
            .fill(0)
            .map((_, i) => (
              <WorkPreview
                ImageSrc={""}
                Title={""}
                Description={""}
                Route={""}
                hidden
                key={i}
              />
            ))}
        </div>
      </div>
    </>
  );
}
