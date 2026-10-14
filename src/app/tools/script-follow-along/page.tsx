import React from "react";
import Link from "next/link";
import Navbar from "@/components/NavBar/NavBar";
import styles from "./ScriptFollowAlong.module.css";

export default function ScriptFollowAlongPage() {
  return (
    <>
      <Navbar />
      <div className={"container " + styles.container}>
        <h1>Script Follow-Along</h1>

        <section className={styles.section}>
          <h2>Privacy Policy</h2>

          <p className={styles.updated}>Last updated: October 14, 2026</p>

          <p>
            Script Follow-Along does not collect, transmit, or share any personal
            information.
          </p>

          <h3>Data stored on your device</h3>
          <p>
            Your projects — show names, imported PDF references, cue index, and
            settings — are saved in a local file on your device. This data never
            leaves your device and is never accessible to us or any third party.
          </p>

          <h3>Network use</h3>
          <p>
            The app listens for OSC (Open Sound Control) messages on your local
            network to provide live cue navigation. It does not send any data over
            the network and does not communicate with any external servers.
          </p>

          <h3>Analytics and tracking</h3>
          <p>
            The app does not use analytics, advertising, or tracking of any kind.
          </p>

          <h3>Changes</h3>
          <p>If this policy changes, the updated version will be posted at this URL.</p>

          <h3>Contact</h3>
          <p>
            Questions about this policy can be sent through the{" "}
            <Link href="/contact" className="animate-hover">contact page</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
