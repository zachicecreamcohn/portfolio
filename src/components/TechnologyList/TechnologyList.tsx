import React from "react";
import styles from "./TechnologyList.module.css";
import TechnologyIcon from "@/components/TechnologyIcon/TechnologyIcon";

interface Category {
  title: string;
  icons: { label: string; className: string }[];
}

const CATEGORIES: Category[] = [
  {
    title: "Frameworks",
    icons: [
      { label: "React", className: "devicon-react-original colored" },
      { label: "Next.js", className: "devicon-nextjs-original colored" },
      { label: "Flask", className: "devicon-flask-original colored" },
      { label: "Symfony", className: "devicon-symfony-original colored" },
      { label: "Bootstrap", className: "devicon-bootstrap-plain colored" },
    ],
  },
  {
    title: "Languages",
    icons: [
      { label: "JavaScript", className: "devicon-javascript-plain colored" },
      { label: "TypeScript", className: "devicon-typescript-plain colored" },
      { label: "Python", className: "devicon-python-plain colored" },
      { label: "PHP", className: "devicon-php-plain colored" },
      { label: "VB.NET", className: "devicon-dot-net-plain colored" },
      { label: "Arduino C", className: "devicon-arduino-plain colored" },
    ],
  },
  {
    title: "Technologies",
    icons: [
      { label: "Git", className: "devicon-git-plain colored" },
      { label: "Firebase", className: "devicon-firebase-plain colored" },
      { label: "HTML5", className: "devicon-html5-plain colored" },
      { label: "CSS3", className: "devicon-css3-plain colored" },
      { label: "MySQL", className: "devicon-mysql-plain colored" },
      { label: "MongoDB", className: "devicon-mongodb-plain colored" },
      {
        label: "AWS",
        className: "devicon-amazonwebservices-original colored",
      },
    ],
  },
  {
    title: "Tools",
    icons: [
      { label: "Figma", className: "devicon-figma-plain colored" },
      { label: "Photoshop", className: "devicon-photoshop-plain colored" },
      { label: "Illustrator", className: "devicon-illustrator-plain colored" },
    ],
  },
];

/**
 * Previously this rendered 5 invisible spacer icons at the end of every
 * category (`<TechnologyIcon spacer>`) purely to influence flex-wrap line
 * breaking. The grid in TechnologyList.module.css handles that natively, so
 * the spacer prop and those 20 hidden elements are gone.
 */
export default function TechnologyList() {
  return (
    <>
      <h2 className={styles.heading}>I am proficient in…</h2>

      {CATEGORIES.map((category) => (
        <section className={styles.technologySection} key={category.title}>
          <h3 className={styles.title}>{category.title}</h3>
          <ul className={styles.technologyIcons}>
            {category.icons.map((icon) => (
              <li key={icon.label}>
                <TechnologyIcon labelText={icon.label}>
                  <i className={icon.className} aria-hidden="true"></i>
                </TechnologyIcon>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
