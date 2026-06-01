'use server'

import { Category } from "@/database/generated/prisma";
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow";
import { prisma } from "@/database/prisma";
import { revalidatePath } from "next/cache";




export default async function upsertCategory(category: Category) {
    const library = await getActiveLibraryOrThrow()

    const dbCategory = await prisma.category.findUnique({ where: { uuid: category.uuid } })
    if (dbCategory) {
        if (dbCategory.libraryUUID !== library.uuid) {
            throw new Error("Unauthorized")
        }
    }

    let uuid = ""

    if (dbCategory) {
        await prisma.category.update({
            where: { uuid: dbCategory.uuid },
            data: {
                name: category.name,
                color: category.color
            }
        })

        uuid = dbCategory.uuid
    } else {
        const newCat = await prisma.category.create({
            data: {
                libraryUUID: library.uuid,
                name: category.name,
                color: category.color
            }
        })
        uuid = newCat.uuid
    }

    revalidatePath("/library")
    revalidatePath("/library/categories")

    return uuid
}