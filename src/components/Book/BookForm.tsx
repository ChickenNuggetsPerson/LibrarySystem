'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "../ui/card"
import { BookWithCategories } from "@/actions/books/getLibraryBooks"
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




export default function BookForm({ book }: { book: BookWithCategories }) {

    const router = useRouter()

    const [state, setState] = useState(book)
    useEffect(() => {
        setState(book)
    }, [book])


    function save() {
        toast.promise(upsertBook(state), {
            loading: "Saving Book",
            success: "Book Saved",
            error: "Error Saving Book"
        })
    }

    function cancel() {
        router.push(getLastSearchURL())
    }

    return (
        <Card className="w-full sm:w-xl">
            <CardContent className="flex flex-col gap-3">

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="mx-auto sm:mx-0">
                        <BookImage src={book.imageLink} updatedAt={book.imageUpdated} />
                    </div>
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
            <CardFooter className="gap-2">
                <Link href={`/library/edit/${book.uuid}/image`}>
                    <Button variant={'outline'} >Change Book Image</Button>
                </Link>
                <Button className="ml-auto" onClick={cancel} >Cancel</Button>
                <Button variant={'secondary'} onClick={save}>Save</Button>
            </CardFooter>
        </Card>
    )
}