import React, {useState} from "react";
import styles from "./TechnologyList.module.css";
import TechnologyIcon from "@/components/TechnologyIcon/TechnologyIcon";

export default function TechnologyList() {
    const spacer =
        <>
            <TechnologyIcon labelText={""}  spacer><span/></TechnologyIcon>
            <TechnologyIcon labelText={""}  spacer><span/></TechnologyIcon>
            <TechnologyIcon labelText={""}  spacer><span/></TechnologyIcon>
            <TechnologyIcon labelText={""}  spacer><span/></TechnologyIcon>
            <TechnologyIcon labelText={""}  spacer><span/></TechnologyIcon>
        </>




    const [selectedProficiency, setSelectedProficiency] = useState("");


    return (
        <>
    <div className={styles.proficiencyHeader}>
        <h2>I am proficient in...</h2>
        {/*
        TODO: Make a hover state technology label work
        <h2 id={styles.selectedProficiency}>{selectedProficiency}</h2>*/}
    </div>

    <div className={styles.technologySection}>
        <p className={styles.title}>Frameworks</p>
        <div className={styles.technologyIcons}>
            <TechnologyIcon labelText="React" setSelectedProficiency={setSelectedProficiency}>
                <i className={"devicon-react-original colored"}></i>
            </TechnologyIcon>

            <TechnologyIcon labelText="Next.js" setSelectedProficiency={setSelectedProficiency}>
                <i className={"devicon-nextjs-original colored"}></i>
            </TechnologyIcon>

            <TechnologyIcon labelText="Flask" setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-flask-original colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText="Symfony" setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-symfony-original colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText="Bootstrap" setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-bootstrap-plain colored"></i>
            </TechnologyIcon>


            {spacer}


        </div>
    </div>

    <div className={styles.technologySection}>
        <p className={styles.title}>Languages</p>
        <div className={styles.technologyIcons}>
            <TechnologyIcon labelText="JavaScript" setSelectedProficiency={setSelectedProficiency}>
                <i className={"devicon-javascript-plain colored"}></i>
            </TechnologyIcon>

            <TechnologyIcon labelText="TypeScript" setSelectedProficiency={setSelectedProficiency}>
                <i className={"devicon-typescript-plain colored"}></i>
            </TechnologyIcon>

            <TechnologyIcon labelText="Python" setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-python-plain colored"></i>
            </TechnologyIcon>

            <TechnologyIcon labelText="PHP" setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-php-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"VB.NET"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-dot-net-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"Arduino C"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-arduino-plain colored"></i>
            </TechnologyIcon>


            {spacer}

        </div>
    </div>

    <div className={styles.technologySection}>
        <p className={styles.title}>Technologies</p>
        <div className={styles.technologyIcons}>
            <TechnologyIcon labelText="Git" setSelectedProficiency={setSelectedProficiency}>
                <i className={"devicon-git-plain colored"}></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"Firebase"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-firebase-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"HTML5"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-html5-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"CSS3"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-css3-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"MySQL"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-mysql-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"MongoDB"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-mongodb-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"AWS"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-amazonwebservices-original colored"></i>
            </TechnologyIcon>


            {spacer}
        </div>
    </div>
    <div className={styles.technologySection}>
        <p className={styles.title}>Tools</p>
        <div className={styles.technologyIcons}>
            <TechnologyIcon labelText={"Figma"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-figma-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"Photoshop"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-photoshop-plain colored"></i>
            </TechnologyIcon>
            <TechnologyIcon labelText={"Illustrator"} setSelectedProficiency={setSelectedProficiency}>
                <i className="devicon-illustrator-plain colored"></i>
            </TechnologyIcon>

        </div>
    </div>
        </>
)
}