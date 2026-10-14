import React from "react";
import Link from "next/link";
import styles from "./Tools.module.css";

interface Tool {
  title: string;
  subtitle: string;
  href: string;
}

const tools: Tool[] = [
  {
    title: "Script Follow-Along",
    subtitle:
      "iPad and Mac app to automatically sync your script with lighting/video/sound cues.",
    href: "/tools/script-follow-along",
  },
];

export default function ToolsPage() {
  return (
    <>
      <div className={styles.container}>
        <h1>Tools</h1>
        <div className={styles.list}>
          {tools.map((tool) => (
            <div key={tool.href} className={styles.row}>
              <Link
                href={tool.href}
                className={`link--headline ${styles.title}`}
              >
                {tool.title}
              </Link>
              <p className={styles.subtitle}>{tool.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
