import React from "react";
import styles from "./Work.module.css";
import WorkPreview from "@/components/WorkPreview/WorkPreview";
import {root} from "postcss";
import Navbar from "@/components/NavBar/NavBar";

export default async function Page({params}: { params: { slug: string } }) {


    // open db.json and get all the projects
    // for each project, render a WorkPreview component


    const works_data = await fetch(process.env.ROOT_URL + "/data/db.json")
        .then(response => response.json())
        .then(data => {
                return data.work
            }
        )


    return (
        <>
        <Navbar />

        <div className={styles.container}>
            <div className={styles.works}>

                {works_data.map((work: {
                        "previewTitle": string,
                        "title": string,
                        "blurb": string,
                        "images": [
                            {
                                "src": string,
                                "isThumb": boolean
                                "isOnContentPage": boolean
                            }
                        ],
                        "videos": [
                            string
                        ],
                        "introText": string,
                        paragraphs: [
                            string
                        ],
                        link: string
                    }, index: number) => {

                        const thumbImage = work.images.find(image => image.isThumb);
                    let imageSrc = thumbImage ? `${thumbImage.src}` : "";


                        return <WorkPreview key={index} ImageSrc={imageSrc} Title={work.previewTitle}
                                            Description={work.blurb} Route={work.link}/>
                    }
                )}

                {Array(8)
                    .fill(0)
                    .map((_, i) => (
                        <WorkPreview ImageSrc={""} Title={""} Description={""} Route={""} hidden key={i}/>

                    ))}
            </div>
        </div>
        </>
    )
}