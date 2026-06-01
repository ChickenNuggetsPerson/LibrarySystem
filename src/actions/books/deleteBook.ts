'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"
import path from "path"
import * as fs from 'fs/promises';
import { revalidatePath } from "next/cache";




export default async function deleteBook(bookUUID: string) {
    const library = await getActiveLibraryOrThrow()
    const book = await prisma.book.findUnique({ where: { uuid: bookUUID, libraryuuid: library.uuid } })
    if (!book) { throw new Error("Book does not exist") }

    await prisma.book.delete({
        where: { uuid: book.uuid }
    })

    const filePath = path.join(process.cwd(), book.imagePath)

    try {
        if (filePath.startsWith("/library")) {
            await fs.unlink(filePath);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }

    revalidatePath("/library")
}