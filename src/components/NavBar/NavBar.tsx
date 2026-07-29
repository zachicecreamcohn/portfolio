"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "./NavBar.module.css";
import Button from "@/components/Button/Button";
import { usePathname } from "next/navigation";
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

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const pages = useMemo(
    () => [
      {
        title: "Home",
        path: "/",
      },
      {
        title: "About",
        path: "/about",
      },
      {
        title: "Design",
        path: "/design",
      },
      //{
      //    title: "Blog",
      //    path: "https://blog.zachwcohn.com"
      //}
    ],
    [],
  );

  const pathname = usePathname();

  return (
    <div className={styles.container + " " + (scrolled ? styles.scrolled : "")}>
      <div className={styles.left}>
        {pages.map((page, index) => {
          return (
            <Link
              key={index}
              href={page.path}
              className={page.path === pathname ? styles.active : ""}
            >
              {page.title}
            </Link>
          );
        })}
      </div>

      <div className={styles.right}>
        <Link href={"/contact"}>
          <Button onClick={() => {}} style={"primary"} className={"no-margin"}>
            Contact
          </Button>
        </Link>
      </div>
    </div>
  );
}
