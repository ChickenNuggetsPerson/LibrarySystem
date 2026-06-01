'use server'

import { Book } from "@/database/generated/prisma";
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow";
import { prisma } from "@/database/prisma";
import { revalidatePath } from "next/cache";





export default async function upsertBook(book: Book) {
    const library = await getActiveLibraryOrThrow()

    const dbBook = await prisma.book.findUnique({ where: { uuid: book.uuid, libraryuuid: library.uuid } })
    let uuid = ""

    if (dbBook) {
        await prisma.book.update({
            where: { uuid: book.uuid },
            data: {
                title: book.title,
                isbn: book.isbn,
                author: book.author,
                description: book.description,
                pageCount: book.pageCount
                // Don't update image link -> This should be done with BookImageUploader
            }
        })
        uuid = book.uuid
    } else {
        const newBook = await prisma.book.create({
            data: {
                title: book.title,
                isbn: book.isbn,
                author: book.author,
                description: book.description,
                pageCount: book.pageCount,
                imageLink: book.imageLink,
                libraryuuid: library.uuid
            }
        })
        uuid = newBook.uuid
    }

    revalidatePath("/library")
    return uuid
}