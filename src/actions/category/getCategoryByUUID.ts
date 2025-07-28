'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"




export default async function getCategoryByUUID(categoryUUID: string) {
    const library = await getActiveLibraryOrThrow()
    return await prisma.category.findUnique({
        where: { uuid: categoryUUID, libraryUUID: library.uuid }
    })
}