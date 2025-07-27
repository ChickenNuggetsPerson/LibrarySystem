'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"
import path from "path"
import * as fs from 'fs/promises';
import { revalidatePath } from "next/cache";




export default async function deleteBook(bookUUID: string) {
    const library = await getActiveLibraryOrThrow()
    const book = await prisma.book.findUnique({ where: { uuid: bookUUID } })
    if (!book) { throw new Error("Book does not exist") }
    if (book.libraryuuid !== library.uuid) { throw new Error("Unauthorized") }

    await prisma.book.delete({
        where: { uuid: book.uuid }
    })

    const fileName = bookUUID
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)

    try {
        await fs.unlink(filePath);
        console.log("Deleted Book")
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }

    revalidatePath("/library")
}