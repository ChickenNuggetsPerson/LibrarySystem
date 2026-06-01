'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"
import { Prisma } from "@/database/generated/prisma"



export type CategoryWithTotal = Prisma.CategoryGetPayload<{ include: { _count: { select: { books: true } } } }>

export default async function getAllCategories() : Promise<CategoryWithTotal[]> {
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