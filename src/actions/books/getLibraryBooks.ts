'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"






export default async function getLibraryBooks() {
    const library = await getActiveLibraryOrThrow()

    return await prisma.book.findMany({
        where: { libraryuuid: library.uuid }
    })
}