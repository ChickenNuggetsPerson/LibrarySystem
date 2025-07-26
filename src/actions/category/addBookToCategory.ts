'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"



export default async function addBookToCategory(bookUUID: string, categoryUUID: string) {
    const library = await getActiveLibraryOrThrow()

    const book = await prisma.book.findUnique({ where: { uuid: bookUUID }})
    if (!book) { throw new Error("Book does not exist") }
    if (book.libraryuuid !== library.uuid) { throw new Error("Insufficient Permissions") }

    const category = await prisma.category.findUnique({ where: { uuid: categoryUUID } })
    if (!category) { throw new Error("Category Does not exist") }
    if (category.libraryUUID !== library.uuid) { throw new Error("Insufficient Permissions") }

    await prisma.book.update({
        where: { uuid: book.uuid },
        data: {
            categories: {
                connect: { uuid: category.uuid }
            }
        }
    })
}