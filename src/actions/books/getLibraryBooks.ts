'use server'

import { prisma } from "@/database/prisma"
import getActiveLibraryOrThrow from "../library/getActiveLibraryOrThrow"
import { Prisma } from "@/database/generated/prisma"


export type BookWithCategories = Prisma.BookGetPayload<{ include: { categories: true } }>
export type LibrarySearchResult = {
    books: BookWithCategories[],
    totalResults: number
}

export default async function getLibraryBooks(search: string, pageIndex: number, pageSize: number, categoryFilter: string | null) {
    const library = await getActiveLibraryOrThrow()

    const filter = {
        libraryuuid: library.uuid,
        categories: categoryFilter ? {
            some: {
                uuid: categoryFilter
            }
        } : undefined,
        OR: [
            { title: { contains: search } },
            { author: { contains: search } }
        ]
    }

    return {
        books: await prisma.book.findMany({
            where: filter,
            include: {
                categories: true
            },
            orderBy: {
                title: 'asc'
            },
            skip: pageIndex * pageSize,
            take: pageSize
        }),
        totalResults: await prisma.book.count({
            where: filter
        })
    }
}