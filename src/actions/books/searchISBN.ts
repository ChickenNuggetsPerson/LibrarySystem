'use server'

import { throwIfInvalidSession } from "@/auth/auth"
import { Book } from "@/database/generated/prisma";
import { emptyBook } from "./emptyBook";


export default async function searchISBN(isbn: string) {
    await throwIfInvalidSession()

    const google = await searchGoogle(isbn)
    if (google) {
        return google
    }

    const openLibrary = await searchOpenLibrary(isbn)
    if (openLibrary) {
        return openLibrary
    }
    
    return null
}

type googleResponse = {
    title?: string
    authors?: string[]
    description?: string
    pageCount?: number
    imageLinks?: {
        thumbnail?: string
    }
}
async function searchGoogle(isbn: string): Promise<Book | null> {
    try {

        const result = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
        const data = await result.json()
        const json = data.items[0].volumeInfo as googleResponse

        console.log(json)

        const book = emptyBook()
        book.isbn = isbn
        book.title = json.title ?? "Not Provided"
        book.author = (json?.authors == undefined) ? "Not Provided" : json.authors[0]
        book.description = json.description ?? "Not Provided"
        book.pageCount = String(json.pageCount ?? "Not Provided")
        book.imageLink = (json.imageLinks?.thumbnail == undefined) ? "" : json.imageLinks.thumbnail
        
        return book

    } catch {
        return null
    }
}


type openResponse = {
    title?: string
    authors?: {url: string, name: string}[]
    excerpts?: string | { text: string }[] 
    number_of_pages: number
    cover?: {
        small?: string,
        medium?: string,
        large?: string
    }
}
async function searchOpenLibrary(isbn: string): Promise<Book | null> {
    try {
        const result = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`)
        const json = Object.values(await result.json())[0] as openResponse
        
        if (!json.title) { return null }

        const book = emptyBook()
        book.isbn = isbn
        book.title = json.title ?? "Not Provided"
        book.author = (json?.authors == undefined) ? "Not Provided" : json.authors[0].name

        if (typeof json.excerpts === "object") {
            book.description = json.excerpts[0].text
        } else {
            book.description = json.excerpts ?? "Not Provided"
        }

        book.pageCount = String(json.number_of_pages ?? "Not Provided")
        book.imageLink = (json?.cover?.large == undefined) ? "" : json.cover.large

        return book

    } catch {
        return null
    }
}