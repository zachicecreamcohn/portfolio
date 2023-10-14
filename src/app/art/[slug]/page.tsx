import React from "react";
import Image from "next/image";
import styles from "./SpecificWork.module.css"
import Video from "@/components/Video/Video";
import NavBar from "@/components/NavBar/NavBar";

export default async function Page({params}: { params: { slug: string } }) {


    const works_data = await fetch(process.env.ROOT_URL + "/data/db.json")
        .then(response => response.json())
        .then(data => {
                // find the art with the matching slug (use the data.art.link property)
                // return that art

                for (let work of data.work) {
                    // get the part of the link after the last slash
                    const slug = work.link.split("/").pop()
                    if (slug === params.slug) {
                        return work;}
                }
            }
        )

    return (
        <>
            <NavBar/>
            <div className={styles.container}>
                <h1>{works_data.title}</h1>
                <p>{works_data.introText}</p>

                <div className={styles.works}>
                    {works_data.videos.map((video: string, index: number) => {
                        return (
                            <div className={styles.videoContainer} key={index}>

                                <Video src={video} poster={works_data.images[0].src}/>
                            </div>


                        )
                    })
                    }
                    {works_data.images.map((image: {
                            src: string,
                            isThumb: boolean,
                            isOnContentPage: boolean
                        }, index: number) => {
                            if (image.isOnContentPage) {
                                return (
                                    <div className={styles.imageContainer} key={index}>
                                        <Image key={index} src={`/${image.src}`}
                                               width={500}
                                               height={500}
                                             alt={works_data.title}/>
                                    </div>
                                )
                            }
                        }
                    )}

                    {
                        // if there is more than 1 image, show the spacers
                        works_data.images.length > 1 &&

                        Array(8)
                        .fill(0)
                        .map((_, i) => (
                            <div
                                className={`${styles.imageContainer} ${styles.hidden}`}
                                key={i}
                            ></div>
                        ))}
                </div>
            </div>
        </>
    )

}