"use client"

import React from "react";

import TechnologyIcon from "@/components/TechnologyIcon/TechnologyIcon";
import styles from "./Dev.module.css";
import Image from "next/image";
import head from "next/head";
import Navbar from "@/components/NavBar/NavBar";

export default function dev() {

    const spacer =
        <>
        <TechnologyIcon labelText={""} spacer><span/></TechnologyIcon>
    <TechnologyIcon labelText={""} spacer><span/></TechnologyIcon>
    <TechnologyIcon labelText={""} spacer><span/></TechnologyIcon>
    <TechnologyIcon labelText={""} spacer><span/></TechnologyIcon>
    <TechnologyIcon labelText={""} spacer><span/></TechnologyIcon>
        </>



    return (
        <>
            <Navbar />

            <head>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css"/>
            </head>

            <div className={"container " + styles.container}>

                <h1>Software Development</h1>
                <div className={"row"}>
                    <div className={"col-md-8 col-12 " + styles.left}>
                        <p className={styles.intro}>
                            I fell in love with software development the summer before my freshman year of college,
                            with Python and Flask. In the years since, I&apos;ve learned a lot.
                            My projects vary, but the thrill of problem-solving stays constant. Here&apos;s a rundown of some of my recent work.
                        </p>
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
                                I&apos;ve been the <b>Head TA</b> for this course for the past three semesters, leading a team of ~15 TAs and overseeing the grading of ~200 students. My role involves assisting students with debugging and comprehending their projects, requiring an in-depth grasp of the course material.</p>

                            <p>
                                I&apos;ve written tools in Python to speed up grading, including a Canvas feedback uploader and an autograder for a project on Python and Regex. I am currently in the process of developing a full-stack grading utility with Next.js and TypeScript to further streamline course management.
                                I have also contributed to the refactoring of the course&apos;s textbook and produced TA training materials.
                            </p>
                            <p>
                                The course covers: <b>HTML/CSS, Git, AWS Linux instances, LAMP stack (Linux, Apache, MySQL, PHP), Python scripting and Regex, Javascript  (AJAX), Node.JS, Socket.IO</b></p>

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


                    <div className={"col-md-1 col-12 " + styles.middle}></div>
                    <div className={"col-md-3 col-12 " + styles.right}>
                        <h2>I am proficient in...</h2>

                        <div className={styles.technologySection}>
                            <p className={styles.title}>Frameworks</p>
                            <div className={styles.technologyIcons}>
                                <TechnologyIcon labelText="React">
                                    <i className={"devicon-react-original colored"}></i>
                                </TechnologyIcon>

                                <TechnologyIcon labelText="Next.js">
                                    <i className={"devicon-nextjs-original colored"}></i>
                                </TechnologyIcon>

                                <TechnologyIcon labelText="Flask">
                                    <i className="devicon-flask-original colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText="Symfony">
                                    <i className="devicon-symfony-original colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText="Bootstrap">
                                    <i className="devicon-bootstrap-plain colored"></i>
                                </TechnologyIcon>


                                {spacer}


                            </div>
                        </div>

                        <div className={styles.technologySection}>
                            <p className={styles.title}>Languages</p>
                            <div className={styles.technologyIcons}>
                                <TechnologyIcon labelText="JavaScript">
                                    <i className={"devicon-javascript-plain colored"}></i>
                                </TechnologyIcon>

                                <TechnologyIcon labelText="TypeScript">
                                    <i className={"devicon-typescript-plain colored"}></i>
                                </TechnologyIcon>

                                <TechnologyIcon labelText="Python">
                                    <i className="devicon-python-plain colored"></i>
                                </TechnologyIcon>

                                <TechnologyIcon labelText="PHP">
                                    <i className="devicon-php-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"VB.NET"}>
                                    <i className="devicon-dot-net-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"Arduino C"}>
                                    <i className="devicon-arduino-plain colored"></i>
                                </TechnologyIcon>


                                {spacer}

                            </div>
                        </div>

                        <div className={styles.technologySection}>
                            <p className={styles.title}>Technologies</p>
                            <div className={styles.technologyIcons}>
                                <TechnologyIcon labelText="Git">
                                    <i className={"devicon-git-plain colored"}></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"Firebase"}>
                                    <i className="devicon-firebase-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"HTML5"}>
                                    <i className="devicon-html5-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"CSS3"}>
                                    <i className="devicon-css3-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"MySQL"}>
                                    <i className="devicon-mysql-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"MongoDB"}>
                                    <i className="devicon-mongodb-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"AWS"}>
                                    <i className="devicon-amazonwebservices-original colored"></i>
                                </TechnologyIcon>


                                {spacer}
                            </div>
                        </div>
                        <div className={styles.technologySection}>
                            <p className={styles.title}>Tools</p>
                            <div className={styles.technologyIcons}>
                                <TechnologyIcon labelText={"Figma"}>
                                    <i className="devicon-figma-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"Photoshop"}>
                                    <i className="devicon-photoshop-plain colored"></i>
                                </TechnologyIcon>
                                <TechnologyIcon labelText={"Illustrator"}>
                                    <i className="devicon-illustrator-plain colored"></i>
                                </TechnologyIcon>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}
