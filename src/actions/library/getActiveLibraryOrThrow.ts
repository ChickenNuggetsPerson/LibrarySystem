'use server'

import { throwIfInvalidSession } from "@/auth/auth"
import { Library } from "@/database/generated/prisma"
import { prisma } from "@/database/prisma"





export default async function getActiveLibraryOrThrow() : Promise<Library> {
    const session = await throwIfInvalidSession()

    const library = await prisma.library.findUnique({ where: { uuid: session.libraryUUID }})
    if (library) {
        return library
    }

    if (!session.isAdmin) {
        return await prisma.library.create({
            data: {
                name: `${session.name}'s Library`,
                userId: session.userID
            }
        })
    }

    throw new Error("Error Getting Active Library")
}