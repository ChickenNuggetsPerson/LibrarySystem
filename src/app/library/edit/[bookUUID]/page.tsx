import getBookByUUID from "@/actions/books/getBookByUUID";
import BookForm from "@/components/Book/BookForm";
import { Suspense } from "react";




export default async function EditBookPage({
    params,
}: {
    params: Promise<{ bookUUID: string }>
}) {

    const bookUUID = (await params).bookUUID

    return (
        <div className="pt-2">
            <div className="w-full flex justify-center mb-4">
                <h1 className="text-text text-2xl font-bold">Edit Book:</h1>
            </div>

            <div className="w-full flex justify-center">
                <Suspense fallback={<div>Loading...</div>}>
                    <Loader uuid={bookUUID} />
                </Suspense>
            </div>
        </div>
    )
}

async function Loader({ uuid }: { uuid: string }) {
    const book = await getBookByUUID(uuid)
    if (!book) {
        return (
            <div>Error Fetching book</div>
        )
    }

    return (<BookForm book={book} />)
}