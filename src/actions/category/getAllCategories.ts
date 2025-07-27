'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"





export default async function getAllCategories() {
    const library = await getActiveLibraryOrThrow()
    return await prisma.category.findMany({
        where: { libraryUUID: library.uuid },
        include: {
            _count: { select: { books: true } }
        },
        orderBy: {
            name: "asc"
        }
    })
}