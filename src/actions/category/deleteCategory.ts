'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"



export default async function deleteCategory(categoryUUID: string) {
    const library = await getActiveLibraryOrThrow()
    const category = await prisma.category.findUnique({ where: { uuid: categoryUUID } })
    if (!category) { throw new Error("Category does not exist") }
    if (category.libraryUUID !== library.uuid) { throw new Error("Unauthorized") }

    await prisma.category.delete({
        where: { uuid: category.uuid }
    })
}