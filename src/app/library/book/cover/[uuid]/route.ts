'use server'

import getActiveLibraryOrThrow from "@/actions/library/getActiveLibraryOrThrow"
import { prisma } from "@/database/prisma"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises";
import path from "path"


export async function GET(_req: NextRequest, ctx: RouteContext<'/library/book/cover/[uuid]'>) {
    try {
        const { uuid } = await ctx.params
        const library = await getActiveLibraryOrThrow()

        const book = await prisma.book.findUniqueOrThrow({
            where: {
                uuid: uuid,
                libraryuuid: library.uuid
            }
        })

        const filePath = path.join(process.cwd(), book.imagePath);
        const fileBuffer = await fs.readFile(filePath);
        const stats = await fs.stat(filePath);
        const body = new Uint8Array(fileBuffer);

        return new Response(body, {
            status: 200,
            headers: {
                "Content-Type": book.imageFileType,
                "Content-Length": stats.size.toString(),
            },
        });
    } catch {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}