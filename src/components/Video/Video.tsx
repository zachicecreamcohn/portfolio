import React from "react";

export default function Video({src, poster}: { src: string, poster: string }) {
    return (
        <video controls width="100%" poster={poster}>
            <source src={src}/>
            Browser doesn&apos;t support video tags
        </video>
    )
}

