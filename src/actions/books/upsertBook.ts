'use server'

import { Book } from "@/database/generated/prisma";
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow";
import { prisma } from "@/database/prisma";





export default async function upsertBook(book: Book) {
    const library = await getActiveLibraryOrThrow()

    const dbBook = await prisma.book.findUnique({ where: { uuid: book.uuid } })
    if (dbBook) {
        if (dbBook.libraryuuid !== library.uuid) {
            throw new Error("Invalid Permissions")
        }
    }

    if (dbBook) {
        await prisma.book.update({
            where: { uuid: book.uuid },
            data: {
                title: book.title,
                isbn: book.isbn,
                author: book.author,
                description: book.description,
                pageCount: book.pageCount,
                imageLink: book.imageLink,
            }
        })
    } else {
        await prisma.book.create({
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
    }
}