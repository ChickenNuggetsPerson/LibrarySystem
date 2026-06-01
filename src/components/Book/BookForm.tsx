'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Input } from "../ui/input"
import { Field, FieldLabel } from "../ui/field"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import BookImage from "./BookImage"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getLastSearchURL } from "../library/SearchHistory"
import toast from "react-hot-toast"
import upsertBook from "@/actions/books/upsertBook"
import { Book } from "@/database/generated/prisma"
import CategoriesModal from "../Categories/CategoriesModal"


function emptyBook(): Book {
    return {
        uuid: "",
        libraryuuid: "",
        isbn: "",
        title: "",
        author: "",
        description: "",
        pageCount: "",
        imageLink: "",
        imageFileType: "",
        imagePath: "",
        imageUpdated: new Date()
    }
}

export default function BookForm({ book, dismiss }: { book?: Book, dismiss?: (saved: boolean, uuid: string) => void }) {

    const isNew = !book || (book?.uuid ?? "").trim() === ""

    const router = useRouter()

    const [state, setState] = useState(emptyBook())
    useEffect(() => {
        if (!book) { return }
        setState(book)
    }, [book])


    async function save() {
        const uuid = await toast.promise(upsertBook(state), {
            loading: "Saving Book",
            success: "Book Saved",
            error: "Error Saving Book"
        })

        if (dismiss) {
            dismiss(true, uuid)
        }
    }

    function cancel() {
        if (isNew) {
            if (dismiss) {
                dismiss(false, "")
            }
        } else {
            router.push(getLastSearchURL())
        }
    }

    return (
        <Card className="w-full sm:w-xl">
            <CardContent className="flex flex-col gap-3">

                <div className="flex flex-col sm:flex-row gap-4">
                    {!isNew &&
                        <div className="mx-auto sm:mx-0">
                            <BookImage src={book.imageLink} updatedAt={book.imageUpdated} />
                        </div>
                    }
                    <div className="w-full flex flex-col gap-3">
                        <Field>
                            <FieldLabel>Title</FieldLabel>
                            <Input value={state.title} onChange={(e) => setState({ ...state, title: e.target.value })} placeholder="Book Title" />
                        </Field>

                        <Field>
                            <FieldLabel>Author</FieldLabel>
                            <Input value={state.author} onChange={(e) => setState({ ...state, author: e.target.value })} placeholder="Book Author" />
                        </Field>
                    </div>
                </div>

                <Field>
                    <FieldLabel>ISBN</FieldLabel>
                    <Input value={state.isbn} onChange={(e) => setState({ ...state, isbn: e.target.value })} placeholder="ISBN" />
                </Field>

                <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea value={state.description} onChange={(e) => setState({ ...state, description: e.target.value })} placeholder="Book Description" />
                </Field>
            </CardContent>
            <CardFooter className="gap-2 flex-wrap">
                {!isNew &&
                    <Link href={`/library/edit/${book.uuid}/image`}>
                        <Button variant={'outline'} >Change Book Image</Button>
                    </Link>
                }
                {!isNew &&
                    <CategoriesModal book={book} refresh={() => {}}/>
                }
                <Button className="ml-auto" onClick={cancel}>Close</Button>
                <Button variant={'secondary'} onClick={save}>Save</Button>
            </CardFooter>
        </Card>
    )
}