"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./NavBar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitch from "@/components/ThemeSwitch/ThemeSwitch";

const PAGES = [
  { title: "Work", path: "/design" },
  { title: "About", path: "/about" },
  { title: "Dev", path: "/dev" },
  { title: "Tools", path: "/tools" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close the mobile menu on navigation, otherwise it stays open over the
     page the user just asked for. */
  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
  }, [pathname]);

  /* Close the mobile menu on Escape. <details> does not do this natively. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menuRef.current?.open) return;
      menuRef.current.open = false;
      menuRef.current.querySelector("summary")?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header
      className={`${styles.container} ${scrolled ? styles.scrolled : ""}`}
    >
      <nav className={styles.inner} aria-label="Main">
        <Link href="/" className={styles.brand}>
          Zach Cohn
        </Link>

        <div className={styles.right}>
          <ul className={styles.links}>
            {PAGES.map((page) => (
              <li key={page.path}>
                <Link
                  href={page.path}
                  className={isActive(page.path) ? styles.active : undefined}
                  aria-current={isActive(page.path) ? "page" : undefined}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>

          <ThemeSwitch />

          <Link href="/contact" className={styles.cta}>
            Contact
          </Link>

          {/*
            Mobile menu. A <details> disclosure keeps this keyboard- and
            screen-reader-accessible without JS, and needs no focus trap.
            Hidden above the nav breakpoint.
          */}
          <details className={styles.menu} ref={menuRef}>
            <summary className={styles.summary}>
              <span className={styles.burger} aria-hidden="true" />
              <span className="sr-only">Menu</span>
            </summary>
            <ul className={styles.menuLinks}>
              {PAGES.map((page) => (
                <li key={page.path}>
                  <Link
                    href={page.path}
                    className={isActive(page.path) ? styles.active : undefined}
                    aria-current={isActive(page.path) ? "page" : undefined}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
              {/* The CTA is hidden under 26rem, so it must survive here. */}
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
