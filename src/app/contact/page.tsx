"use client";

import React from "react";

import HeroBackdrop from "@/components/HeroBackdrop/HeroBackdrop";
import styles from "./Contact.module.css";

export default function Contact() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [alertMessage, setAlertMessage] = React.useState("");
  async function sendEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const response = await fetch("contact/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await response.json();

    if (data.status === 200) {
      setAlertMessage("Email sent successfully");
    } else {
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
    <>
      <HeroBackdrop />
      <div className={styles.container}>
        {alertMessage ? (
          <div className={styles.alert} role="status">
            {alertMessage}
          </div>
        ) : (
          <>
            <h1>Get in touch</h1>
            <form className={styles.form} onSubmit={sendEmail}>
              <div className={styles.field}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="First Last"
                  required
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="placeholder@test.com"
                  required
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="message">Message</label>
                <textarea
                  name="message"
                  id="message"
                  placeholder="Let's work together!"
                  required
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  value={message}
                />
              </div>

              <button type="submit" className={styles.submit}>
                Send
              </button>
            </form>

            <div className={styles.contactInfo}>
              <p>
                <a href="mailto:contact@zachwcohn.com">contact@zachwcohn.com</a>
                <span aria-hidden="true"> · </span>
                <a href="tel:+16464772420">(646)-477-2420</a>
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
