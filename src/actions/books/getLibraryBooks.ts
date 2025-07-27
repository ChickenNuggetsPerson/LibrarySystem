'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"
import { BookWithCategories } from "@/components/library/LibraryList"





export default async function getLibraryBooks() : Promise<BookWithCategories[]> {
    const library = await getActiveLibraryOrThrow()

    return await prisma.book.findMany({
        where: { libraryuuid: library.uuid },
        include: { categories: true }
    })
}