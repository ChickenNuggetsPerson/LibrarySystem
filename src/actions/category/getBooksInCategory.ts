'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"
import { Book } from "@/database/generated/prisma"





export default async function getBooksInCategory(categoryUUID: string) : Promise<Book[]> {
    const library = await getActiveLibraryOrThrow()
    const category = await prisma.category.findUnique({ where: { uuid: categoryUUID }, include: { books: true } })
    if (!category) {
        throw new Error("Category Does not Exist")
    }

    if (category.libraryUUID !== library.uuid) { 
        throw new Error("Insufficient Permissions")
    }

    return category.books
}