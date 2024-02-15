import React from "react";
import Image from "next/image";
import styles from "./SpecificWork.module.css"
import Video from "@/components/Video/Video";
import NavBar from "@/components/NavBar/NavBar";

import dbData from "../../../../public/data/db.json"
import {Project} from "@/Types";

export default async function Page({params}: { params: { slug: string } }) {


    return (
        <>
            <NavBar/>

                <div className={styles.container}>
                    <h1>Love Note Printer</h1>
                    <p>For a recent anniversary gift for my girlfriend, Nina, I designed a device that uses a Raspberry Pi Zero W, a thermal (receipt) printer, and an lcd display to print daily love notes. For this project, I designed and 3D printed an enclosure. Node.js code interfaces with Socket.js code written in TypeScript that runs on an ec2 server. A client application, written in React, allows me to upload and manage love notes and other messages. Each morning, a random message is printed on the printer and marked as &ldquo;sent&rdquo; so it can&apos;t be printed again.</p>


                    <div className={styles.works}>

                        <div className={styles.imageContainer}>
                            <img src={"https://imagedelivery.net/jz7aVQ2qyRcSQ0bsKclVwA/74f403a5-d0f7-4023-d73e-9690cfff2100/public"}
                                 width={1000}
                                 height={1000}
                                 alt={"Screenshot of Manage Notes page of web client"}/>
                        </div>


                    </div>
                </div>

        </>
    )

}