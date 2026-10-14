import React from "react";
import styles from "@/components/WorkDetail/WorkDetail.module.css";

import dbData from "../../../../public/data/db.json";
import { Project } from "@/Types";

export function generateStaticParams() {
  return dbData.work
    .filter((work: Project) => !work.hidden)
    .map((work: Project) => ({ slug: work.link.split("/").pop() ?? "" }))
    .filter((entry: { slug: string }) => entry.slug.length > 0);
}

export default function Page({ params }: { params: { slug: string } }) {
  const slugData: Project | undefined = dbData.work.find(
    (work: Project) => work.link.split("/").pop() === params.slug,
  );

  if (!slugData) return null;

  const contentImages = slugData.images.filter(
    (image) => image.isOnContentPage,
  );

  return (
    <div className={styles.container}>
      <h1>{slugData.title}</h1>
      {slugData.introText && <i className={styles.intro}>{slugData.introText}</i>}

      {slugData.paragraphs.map((paragraph: string, index: number) => (
        <p key={index}>{paragraph}</p>
      ))}

      <div className={styles.works}>
        {slugData.videos.map((video: string, index: number) => (
          <div className={styles.videoContainer} key={`video-${index}`}>
            <iframe
              src={video}
              allowFullScreen={true}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              title={`${slugData.title} — video ${index + 1}`}
            ></iframe>
          </div>
        ))}

        {contentImages.map((image, index) => (
          <div className={styles.imageContainer} key={`image-${index}`}>
            <img
              src={image.src}
              alt={`${slugData.title} — image ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
