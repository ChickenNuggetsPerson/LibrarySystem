import getBookByUUID from "@/actions/books/getBookByUUID";
import BookImageUploader from "@/components/Book/BookImageUploader";
import { Button } from "@/components/ui/button";
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
            <div className="w-full flex justify-center mb-4 mt-2">
                <h1 className="text-text text-2xl font-bold">Edit Image:</h1>
            </div>

            <div className="w-full flex justify-center">
                <Suspense fallback={<div>Loading...</div>}>
                    <Loader uuid={bookUUID} />
                </Suspense>
            </div>

            <div className="w-full flex justify-center gap-4 mt-8">

                <Link href={`/library/edit/${bookUUID}`}>
                    <Button variant={'default'}>
                        Edit Book
                    </Button>
                </Link>

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

    return (<BookImageUploader book={book} />)
}
