import getBookByUUID from "@/actions/books/getBookByUUID";
import BookImageUploader from "@/components/Book/BookImageUploader";
import Link from "next/link";
import { Suspense } from "react";




export default async function EditBookImagePage({
    params,
}: {
    params: Promise<{ bookUUID: string }>
}) {

    const bookUUID = (await params).bookUUID

    return (
        <div className="">
            <div className="w-full flex justify-center mb-4">
                <h1 className="text-text text-2xl font-bold">Edit Image:</h1>
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

    return (
        <div>
            <BookImageUploader book={book}/>

            <div className="flex w-full justify-between gap-4 mt-8">

                <Link className="w-full" href="/library">
                    <div className="primary-button text-center">
                        Back To Library
                    </div>
                </Link>
                <Link className="w-full" href={`/library/edit/${book.uuid}`}>
                    <div className="secondary-button text-center">
                        Edit Book
                    </div>
                </Link>

            </div>
        </div>
    )
}