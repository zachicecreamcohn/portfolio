"use client"

import './globals.css'
import './theming.css'
import "../../public/fonts/fonts.css"
import type { Metadata } from 'next'
import Navbar from "../components/NavBar/NavBar"
import React, {useState} from "react";
import MainContainer from "@/components/Layout/MainContainer/MainContainer";
import "../bootstrap.min.css"

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
      <body>
      <MainContainer>
      <Navbar />
      {children}

      </MainContainer>

      </body>
    </html>
  )
}

