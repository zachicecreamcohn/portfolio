import React from "react";
import Image from "next/image";
import styles from "./SpecificWork.module.css"
import Video from "@/components/Video/Video";
import NavBar from "@/components/NavBar/NavBar";

import dbData from "../../../../public/data/db.json"
import {Project} from "@/Types";

export default async function Page({params}: { params: { slug: string } }) {

    const getSlugData = (): Project | undefined => {
        for (let work of dbData.work) {
            // get the part of the link after the last slash
            const slug = work.link.split("/").pop();
            if (slug === params.slug) {
                return work;
            }
        }
        // Optionally return undefined explicitly if no match is found
        return undefined;
    }

    const slugData: Project | undefined = getSlugData();

    return (
        <>
            <NavBar/>
            {slugData &&
                <div className={styles.container}>
                    <h1>{slugData.title}</h1>
                    <p>{slugData.introText}</p>

                    <div className={styles.works}>
                        {slugData.videos.map((video: string, index: number) => {
                            // @ts-ignore
                            return (
                                <div className={styles.videoContainer} key={index}>
                                    <iframe
                                        src={video}
                                        allowFullScreen={true}
                                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                    ></iframe>
                                </div>


                            )
                        })
                        }
                        {slugData.images.map((image: {
                                src: string,
                                isThumb: boolean,
                                isOnContentPage: boolean
                            }, index: number) => {
                                if (image.isOnContentPage) {
                                    return (
                                        <div className={styles.imageContainer} key={index}>
                                            <img key={index} src={`${image.src}`}
                                                 width={1000}
                                                 height={1000}
                                                 alt={slugData.title}/>
                                        </div>
                                    )
                                }
                            }
                        )}

                        {
                            // if there is more than 1 image, show the spacers
                            slugData.images.length > 1 &&

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
            }
                </>
                )

            }