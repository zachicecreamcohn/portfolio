import React from "react";
import styles from "@/components/WorkDetail/WorkDetail.module.css";

const SCREENSHOT_ID = "74f403a5-d0f7-4023-d73e-9690cfff2100";

export default function Page() {
  return (
    <div className={styles.container}>
      <h1>Love Note Printer</h1>
      <p>
        For a recent anniversary gift for my girlfriend, Nina, I designed a
        device that uses a Raspberry Pi Zero W, a thermal (receipt) printer, and
        an lcd display to print daily love notes. For this project, I designed
        and 3D printed an enclosure. Node.js code interfaces with Socket.js code
        written in TypeScript that runs on an ec2 server. A client application,
        written in React, allows me to upload and manage love notes and other
        messages. Each morning, a random message is printed on the printer and
        marked as &ldquo;sent&rdquo; so it can&apos;t be printed again.
      </p>

      <div className={styles.works}>
        {/* `contain` rather than `cover`: this is a UI screenshot and must not
            be cropped. */}
        <div className={`${styles.imageContainer} ${styles.contain}`}>
          <img
            src={`https://imagedelivery.net/jz7aVQ2qyRcSQ0bsKclVwA/${SCREENSHOT_ID}/public`}
            alt="Screenshot of the Manage Notes page of the web client"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
