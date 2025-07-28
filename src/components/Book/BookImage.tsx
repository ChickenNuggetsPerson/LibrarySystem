'use client'

import Image from "next/image"
import { useState } from "react";
import ClickableDiv from "../Decorative/ClickableDiv";




export default function BookImage({ src, updatedAt, hoverable }: { src: string, updatedAt?: Date, hoverable?: boolean }) {

    const [imageLoaded, setImageLoaded] = useState(false);
    hoverable = hoverable ?? true;

    if (src.trim() == "") {
        return (
            <ClickableDiv
                enabled={hoverable}
                className="card"
                style={{
                    padding: 5,
                    width: 100,
                    height: 130
                }}
            > Invalid Image </ClickableDiv>
        )
    }

    const str = src + (updatedAt ? ("?cache=" + updatedAt.getTime()) : "")

    return (
        <ClickableDiv enabled={hoverable} style={{
            position: 'relative',
            width: 100,
            height: "auto",
            aspectRatio: '3 / 4'
        }}>
            <Image
                fill
                src={str}
                alt="ImageName"
                onLoad={() => setImageLoaded(true)}
                style={{
                    padding: 1,
                    objectFit: "contain"
                }}
                className={`card ${imageLoaded ? "" : "animate-pulse"}`}
            />
        </ClickableDiv>
    )
}