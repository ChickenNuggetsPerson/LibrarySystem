'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"





export default async function deleteBook(bookUUID: string) {
    const library = await getActiveLibraryOrThrow()
    const book = await prisma.book.findUnique({ where: { uuid: bookUUID } })
    if (!book) { throw new Error("Book does not exist") }
    if (book.libraryuuid !== library.uuid) { throw new Error("Unauthorized") }

    await prisma.book.delete({
        where: { uuid: book.uuid }
    })
}