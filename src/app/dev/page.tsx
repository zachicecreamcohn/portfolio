
"use client"

import React, { useState } from "react";
import TechnologyIcon from "@/components/TechnologyIcon/TechnologyIcon";
import styles from "./Dev.module.css";
import Image from "next/image";
import Head from "next/head"; // Correct import for Head
import Navbar from "@/components/NavBar/NavBar";
import Link from "next/link";
export default function dev() { // Capitalize the component name

    return (
        <>
            <Navbar />

            <Head>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css" />
            </Head>

            <div className={"container " + styles.container}>

                <h1>Software Development</h1>
                <div>
                    <div className={"col-12 " + styles.left}>
                        <p className={styles.intro}>
                            I fell in love with software development the summer before my freshman year of college,
                            with Python and Flask. In the years since, I&apos;ve learned a lot.
                            My projects vary, but the thrill of problem-solving stays constant. Here&apos;s a rundown of some of my recent work.
                        </p>
                        <p>Helfpul utilities: <Link href="https://utilities.zachwcohn.com">utilities.zachwcohn.com</Link></p>
                        <div className={styles.experienceSection}>
                            <h2>Amplify Education</h2>
                            <p>
                                As a <b>Software Engineer Intern</b> at Amplify, I contributed to the Desmos Classroom project by improving the curriculum builder tool. I optimized the user experience by implementing features such as add-by-search, which reduced the time required for repetitive tasks by more than 75%. Working closely with designers, product managers, and engineers, I ensured that product requirements were met, streamlining the process for educators.
                            </p>
                            <p>
                                Technologies used: <b>React, TypeScript, Node, ElasticSearch, Git, DataDog</b>
                            </p>
                        </div>
                        <div className={styles.experienceSection}>
                        <h2>Student Life Newspaper, Washington University in St. Louis</h2>
                        <p>
As <b>Senior Web Editor</b>, I led the website redesign with a focus on boosting click-through rates and ad revenue. I refactored legacy code for better performance and implemented custom WordPress solutions. Along with developing new web applications, I managed site maintenance and updates. I also introduced a directory and Jira tracking system, improving team communication and project management.
        </p>
        <p>
            Technologies used: <b>WordPress, PHP, JavaScript, HTML/CSS, Git</b>
            </p>
            </div>
                        <div className={styles.experienceSection}>
                            <h2>Creative Conners, Inc.</h2>
                            <p>In my role as a <b>Software Engineer Intern</b> at CCI, my primary responsibility was the development of Dark Mode for the company&apos;s scenic automation application, Spikemark. This entailed refactoring the existing design system, creating a custom theming system, and implementing it across the application. My code underwent reviews by my manager, leading to adjustments that enhanced the final product. I also wrote tests to ensure the reliability and quality of the new features.
                            </p>
                            <p>
                                Technologies used: <b>VB.NET, C#, WPF, Git</b>
                            </p>
                        </div>

                        <div className={styles.experienceSection}>
                            <h2>Rapid Prototype Development and Creative Programming</h2>
                            <p>
                                I&apos;ve been the <b>Head TA</b> for this course for the past three semesters, leading a team of ~15 TAs and overseeing the grading of ~200 students. My role involves assisting students with debugging and comprehending their projects, requiring an in-depth grasp of the course material.
                            </p>

                            <p>
                                I&apos;ve written tools in Python to speed up grading, including a Canvas feedback uploader and an autograder for a project on Python and Regex.
                                I have also contributed to the refactoring of the course&apos;s textbook and produced TA training materials.
                            </p>
                            <p>
                                The course covers: <b>HTML/CSS, Git, AWS Linux instances, LAMP stack (Linux, Apache, MySQL, PHP), MERN stack (MongoDB, Express, React, Node.js), Python scripting and Regex, Javascript, and Socket.IO</b></p>

                        </div>

                        <div className={styles.experienceSection}>
                            <h2>
                                Artwork and Operations Management Platform
                            </h2>
                            <p>
                                For eight months, I led the development of a full-stack app for a notable pop artist, enabling inventory oversight, sales monitoring, and gallery-client interactions. Key features include a specialized TIFF image upload system via Cloudflare and R2, as well as advanced search with Boolean, exact matching, and fuzzy algorithms. To balance growing academic demands, I onboarded a qualified developer for continued success, ensuring a smooth handoff without sacrificing project quality.
                            </p>
                            <p>
                                Technologies used: <b>React, Next.js, MySQL (DigitalOcean), Cloudflare (Workers, R2, Images), Git, Figma</b>
                            </p>
                        </div>

                        <div className={styles.experienceSection}>
                            <h2>
                                Center Stage Software
                            </h2>
                            <p>
                                As a <b>Web Developer Intern</b> at CCI, a theater ticketing software company, I was responsible for
                                the development of the company&apos;s new customer-facing ticketing web app. I also contributed to the migration of a
                                legacy Windows admin app to a web-based product. </p>
                            <p>
                                Technologies used: <b>Symfony, PHP, MySQL, Git, LAMP Stack</b>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
