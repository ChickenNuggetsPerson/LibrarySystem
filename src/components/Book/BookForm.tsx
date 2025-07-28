'use client'

import { Book } from "@/database/generated/prisma"
import { useState } from "react"
import TextInput from "../Forms/TextInput"
import LargeTextInput from "../Forms/LargeTextInput"
import Link from "next/link"
import toast from "react-hot-toast"
import upsertBook from "@/actions/books/upsertBook"
import { useRouter } from "next/navigation"
import BookImage from "./BookImage"
import getLibraryLink from "../library/LibraryLink"



function emptyBook(): Book {
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


export default function BookForm({ book }: { book?: Book }) {

    const router = useRouter()
    const [state, setState] = useState(book ?? emptyBook())

    async function save(editImage: boolean) {
        const uuid = await toast.promise(upsertBook(state), {
            loading: "Saving Book",
            success: "Book Saved",
            error: "Error Saving Book"
        })

        if (editImage) {
            router.push(`/library/edit/${state.uuid}/image`)
        } else {
            if (book) {
                router.push("/library")
            } else {
                router.push(`/library/edit/${uuid}/image`)
            }
        }

    }

    function clickedImage() {
        save(true)
    }

    let libraryLink = "/library"
    if (book?.uuid) {
        libraryLink = getLibraryLink(book.uuid)
    }

    return (
        <div className="card w-sm">

            <div className="flex justify-between w-full gap-4">
                <div>
                    <TextInput label="Title" val={state.title} onChange={(val) => setState({ ...state, title: val })} />
                    <TextInput label="Author" val={state.author} onChange={(val) => setState({ ...state, author: val })} />
                </div>

                {book?.uuid &&
                    <div onClick={clickedImage}>
                        <BookImage src={state.imageLink} updatedAt={state.imageUpdated} />
                    </div>
                }
            </div>

            <div style={{ height: 10 }}></div>

            <LargeTextInput label="Description" val={state.description} onChange={(val) => setState({ ...state, description: val })} />
            <TextInput label="ISBN" val={state.isbn} onChange={(val) => setState({ ...state, isbn: val })} />

            <div className="flex justify-between w-full gap-4">

                <Link href={libraryLink} className="w-full">
                    <div className="accent-button text-center">
                        Cancel
                    </div>
                </Link>

                <button className="w-full" onClick={() => save(false)}>
                    <div className="primary-button text-center">
                        Save Changes
                    </div>
                </button>


            </div>
        </div>
    )
}