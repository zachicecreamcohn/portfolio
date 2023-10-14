"use client"

import './globals.css'
import './theming.css'
import "../../public/fonts/fonts.css"
import type {Metadata} from 'next'
import Navbar from "../components/NavBar/NavBar"
import React, {useState} from "react";
import MainContainer from "@/components/Layout/MainContainer/MainContainer";
import "../bootstrap.min.css"
import Footer from "@/components/Footer/Footer";

// TODO: find a way to use metadata and the theme switcher
//  the issue is that metadata requires server side component and the theme switcher requires client side component
// export const metadata: Metadata = {
//   title: 'Zach Cohn',
//   description: 'Zach Cohn is a software engineer and theatre artist based in New York City.',
// }


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {


    return (
        <html lang="en">
        <head>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
        </head>
        <body>
        <MainContainer>
            {children}
            <Footer/>


        </MainContainer>
        </body>
        </html>
    )
}

