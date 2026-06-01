'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"



export default async function getBookByUUID(bookUUID: string) {
    const library = await getActiveLibraryOrThrow()
    return await prisma.book.findUnique({
        where: { uuid: bookUUID, libraryuuid: library.uuid },
        include: { categories: true }
    })
}