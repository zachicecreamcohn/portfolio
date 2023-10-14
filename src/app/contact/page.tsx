"use client"

import React  from "react";

import styles from "./Contact.module.css";
import Button from "@/components/Button/Button";

export default function Contact() {

    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [alertMessage, setAlertMessage] = React.useState("");
    async function sendEmail(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();



        const response = await fetch('contact/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, email, message})
        });

        const data = await response.json();

        if (data.status === 200) {
            setAlertMessage("Email sent successfully");

        }
        else {
            setAlertMessage("Error sending email");
        }

        setTimeout(() => {
            setAlertMessage("");
            setName("");
            setEmail("");
            setMessage("");
        }, 1000);
        }


    return (
        <div className={styles.container}>
            <div className={styles.contactContainer}>
                {alertMessage ? <div className={styles.alert}>{alertMessage}</div> : (<>
            <h1>Get in touch</h1>
                <div className={styles.contact}>
                    <form action="#" method="POST" className="" onSubmit={sendEmail}>
                        <div className="d-flex flex-column mb-3">
                            <label htmlFor="name">Name</label>
                            <input type="text" name="name" id="name" className="mt-1" placeholder="Hugh Jackman" required onChange={
                                (e) => {
                                    setName(e.target.value);
                                }
                            }
                                   value={name}
                            />
                        </div>

                        <div className="d-flex flex-column mb-3">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" className="mt-1" placeholder="thewolverine@xmen.com" required onChange={
                                (e) => {
                                    setEmail(e.target.value);
                                }
                            }
                            value={email}/>
                        </div>

                        <div className="d-flex flex-column mb-3">
                            <label htmlFor="message">Message</label>
                            <textarea className="mt-1" name="message" id="message" placeholder="What's a Magneto?" required onChange={
                                (e) => {
                                    setMessage(e.target.value);
                                }
                            }

                            value={message}/>
                        </div>

                        <div className="d-flex justify-content-center">
                        <Button  style={"primary"} className={styles.customButton}>
                            Send
                        </Button>
                        </div>


                    </form>
                </div>
                    <div className={styles.contactInfo}>

                        <p><a href="mailto:zcohn@wustl.edu">zcohn@wustl.edu</a> | <a href="tel:646-477-2420">(646)-477-2420</a>
                        </p>
                    </div>

                </>)}
        </div>
        </div>
    )
}
