'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"
import { revalidatePath } from "next/cache"



export default async function updateBookCategories(bookUUID: string, categoryUUIDs: string[]) {
    const library = await getActiveLibraryOrThrow()

    const book = await prisma.book.findUnique({ where: { uuid: bookUUID } })
    if (!book) throw new Error("Book does not exist")
    if (book.libraryuuid !== library.uuid) throw new Error("Insufficient permissions for book")

    const categories = await prisma.category.findMany({
        where: {
            uuid: { in: categoryUUIDs },
            libraryUUID: library.uuid, // Ensures permission
        },
        select: { uuid: true }, // Only need UUIDs
    })

    const foundUUIDs = new Set(categories.map(c => c.uuid))
    const missing = categoryUUIDs.filter(id => !foundUUIDs.has(id))
    if (missing.length > 0) {
        throw new Error(`Some categories do not exist or you do not have access: ${missing.join(', ')}`)
    }

    await prisma.book.update({
        where: { uuid: book.uuid },
        data: {
            categories: {
                set: categoryUUIDs.map(uuid => ({ uuid })),
            },
        },
    })

    revalidatePath("/library")
    revalidatePath("/library/categories")
}