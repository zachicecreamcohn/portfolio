"use client"

import React, {useEffect, useState, useMemo} from "react";
import styles from "./NavBar.module.css";
import Button from "@/components/Button/Button";
import {useRouter} from "next/router";
import Link from "next/link";

export default function NavBar() {

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    const pages = useMemo(() => [
        {
            title: "Home",
            path: "/"
        },
        {
            title: "About",
            path: "/about"
        },
        {
            title: "Work",
            path: "/work"
        }
    ], []);


    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    useEffect(() => {
        function getIndexFromPath(path: string) {
            for (let i = 0; i < pages.length; i++) {
                if (pages[i].path === path) {
                    return i;
                }
            }
        }
        // get the current page via the window object

        const currentPage = window.location.pathname;
        const currentPageIndex = getIndexFromPath(currentPage);
        if (currentPageIndex) {
            setCurrentPageIndex(currentPageIndex);
        }
    }, [pages]);





    return (
        <div className={styles.container + " " + (scrolled ? styles.scrolled : "")}>
            <div className={styles.left}>

        {pages.map((page, index) => {
            return (
                <a key={index} href={page.path} className={index === currentPageIndex ? styles.active : ""}>
                    {page.title}
                </a>
            )
        })}

            </div>

            <div className={styles.right}>
                <Link href={"/contact"}>
                <Button content={"Contact"} onClick={() => {}} style={"primary"} className={"no-margin"}/>
                </Link>
            </div>
        </div>
    )
}