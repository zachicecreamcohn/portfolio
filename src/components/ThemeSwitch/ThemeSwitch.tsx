import React from "react";
import Image from "next/image";

import styles from "./ThemeSwitch.module.css";
export default function ThemeSwitch({currentTheme, setTheme}: {
    // a state var
    currentTheme: string,

    // setCurrentTheme is a setter function for state that takes a string
    setTheme: (theme: "theme1" | "theme2" | "theme3" | "theme4") => void
}) {


    function onPress() {
        console.log("pressed")
        console.log(currentTheme)
        if (currentTheme === "theme1" || currentTheme === undefined)  {
            setTheme("theme2")
        } else if (currentTheme === "theme2") {
            setTheme("theme3")
        } else if (currentTheme === "theme3") {
            setTheme("theme4")
        } else if (currentTheme === "theme4") {
            setTheme("theme1")
        }
    }


    return (
        <div className={styles.container}>
        <button onClick={onPress}>
            <Image
                src={"/icons/brush-solid.svg"}
                alt={"paintbrush icon"}
                width={28}
                height={28}
            />
        </button>
        </div>
    )
}