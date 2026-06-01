'use server'

import { throwIfInvalidSession, updateSession } from "@/auth/auth"
import { prisma } from "@/database/prisma"






export default async function setActiveLibrary(libraryUUID: string) {
    const session = await throwIfInvalidSession()
    
    const library = await prisma.library.findUnique({ where: { uuid: libraryUUID } })
    if (!library) { throw new Error("Invalid Library UUID") }

    if (!session.isAdmin && library.userId !== session.userID) {
        throw new Error("Unauthorized")
    }

    updateSession({
        ...session,
        libraryUUID: library.uuid
    })

}