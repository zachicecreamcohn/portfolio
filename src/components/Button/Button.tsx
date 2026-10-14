import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary";

interface BaseProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

interface ButtonAsButton extends BaseProps {
  href?: undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  /** External links open in a new tab and get the matching rel. */
  external?: boolean;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Renders a button, or a link styled as a button when `href` is given.
 *
 * This exists because the previous API was `<button>`-only, so every link CTA
 * was written as `<Link><Button/></Link>` — an interactive element nested
 * inside another, which is invalid and breaks keyboard and screen-reader
 * behaviour.
 */
export default function Button(props: ButtonProps) {
  const { children, variant = "primary", className } = props;
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { href, external } = props;
    return (
      <Link
        href={href}
        className={classes}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : undefined)}
      >
        {children}
      </Link>
    );
  }

  const { onClick } = props;
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
