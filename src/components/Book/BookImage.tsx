'use client'

import Image from "next/image"
import { useState } from "react";




export default function BookImage({ src, updatedAt }: { src: string, updatedAt?: Date }) {

    const [imageLoaded, setImageLoaded] = useState(false);

    if (src.trim() == "") {
        return (
            <div
                className="card"
                style={{
                    padding: 5,
                    width: 100,
                    height: 130
                }}
            > Invalid Image </div>
        )
    }

    const str = src + (updatedAt ? ("?cache=" + updatedAt.getTime()) : "")

    return (
        <Image
            width={200}
            height={200}
            src={str}
            alt="ImageName"
            onLoad={() => setImageLoaded(true)}
            style={{
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.5s ease-in',
                padding: 1
            }}
            className="card"
        />
    )
}