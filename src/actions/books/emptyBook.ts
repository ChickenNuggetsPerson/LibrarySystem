import { Book } from "@/database/generated/prisma";




export function emptyBook(): Book {
    return {
        uuid: "",
        libraryuuid: "",
        title: "",
        isbn: "",
        author: "",
        description: "",
        pageCount: "",
        imageLink: "",
        imageUpdated: new Date()
    }
}