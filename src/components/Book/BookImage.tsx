'use client'

import Image from "next/image"
import { useState } from "react";




export default function BookImage({ src }: { src: string }) {

    const [imageLoaded, setImageLoaded] = useState(false);

    if (src.trim() == "") {
        return (<div> Invalid Image </div>)
    }

    return (
        <Image 
            width={200}
            height={200}
            src={src}
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