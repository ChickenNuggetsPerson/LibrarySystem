import getLibraryBooks from "@/actions/books/getLibraryBooks"






export default async function LibraryList() {
    const books = await getLibraryBooks()

    return (
        <div>
            {JSON.stringify(books)}
        </div>
    )
}