'use client'

import Image from "next/image"
import { useState } from "react";
import ClickableDiv from "../Decorative/ClickableDiv";
import { cn } from "@/lib/utils";




export default function BookImage({ src, updatedAt, hoverable = true, reactKey }: { src: string, updatedAt?: Date | string, hoverable?: boolean, reactKey?: string }) {

    const [imageLoaded, setImageLoaded] = useState(false);

    if (src.trim() == "") {
        return (
            <ClickableDiv
                key={reactKey}
                enabled={hoverable}
                className="card"
                style={{
                    padding: 5,
                    width: 100,
                    height: 130
                }}
            >
                Invalid Image
            </ClickableDiv>
        )
    }

    const isBlobLike = src.startsWith("blob:") || src.startsWith("data:")
    const isProtectedRoute = src.startsWith("/library/book/cover/")
    const unoptimized = isBlobLike || isProtectedRoute

    const updatedAtMs = updatedAt ? new Date(updatedAt).getTime() : null
    const hasValidUpdatedAt = typeof updatedAtMs === "number" && Number.isFinite(updatedAtMs)
    const cacheSeparator = src.includes("?") ? "&" : "?"
    const str = hasValidUpdatedAt && !isBlobLike
        ? `${src}${cacheSeparator}cache=${updatedAtMs}`
        : src

    return (
        <ClickableDiv
            key={reactKey}
            enabled={hoverable}
            style={{
                position: 'relative',
                width: 100,
                height: "auto",
                aspectRatio: '3 / 4'
            }}
        >
            <Image
                fill
                src={str}
                alt="ImageName"
                sizes="100px"
                unoptimized={unoptimized}
                onLoad={() => setImageLoaded(true)}
                style={{
                    padding: 1,
                    objectFit: "contain"
                }}
                className={cn(
                    !imageLoaded && "animate-pulse"
                )}
            />
        </ClickableDiv>
    )
}