'use server'

import { Book } from "@/database/generated/prisma";





export default async function searchBookISBN(isbn: string) : Promise<Book | null> {
    throw new Error("TODO: Work on this function " + isbn)
}