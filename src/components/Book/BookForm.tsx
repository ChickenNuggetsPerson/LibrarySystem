'use client'

import { Book } from "@/database/generated/prisma"
import { useState } from "react"
import TextInput from "../Forms/TextInput"
import LargeTextInput from "../Forms/LargeTextInput"
import Link from "next/link"
import toast from "react-hot-toast"
import upsertBook from "@/actions/books/upsertBook"
import { useRouter } from "next/navigation"



function emptyBook(): Book {
    return {
        uuid: "",
        libraryuuid: "",
        title: "",
        isbn: "",
        author: "",
        description: "",
        pageCount: "",
        imageLink: ""
    }
}


export default function BookForm({ book }: { book?: Book }) {

    const router = useRouter()
    const [state, setState] = useState(book ?? emptyBook())

    function save() {
        toast.promise(async () => {
            await upsertBook(state)
            router.push("/library")
        }, {
            loading: "Saving Book",
            success: "Book Saved",
            error: "Error Saving Book"
        })

    }

    return (
        <div className="card w-full max-w-lg">

            <TextInput label="Title" val={state.title} onChange={(val) => setState({ ...state, title: val })} />
            <TextInput label="Author" val={state.author} onChange={(val) => setState({ ...state, author: val })} />
            
            <div style={{ height: 10 }}></div>

            <LargeTextInput label="Description" val={state.description} onChange={(val) => setState({ ...state, description: val })} />

            <TextInput label="ISBN" val={state.isbn} onChange={(val) => setState({ ...state, isbn: val })} />

            <div className="flex justify-between w-full gap-4">

                <Link href="/library" className="w-full">
                    <div className="accent-button text-center">
                        Cancel
                    </div>
                </Link>

                <button className="w-full" onClick={save}>
                    <div className="primary-button text-center">
                        Add
                    </div>
                </button>


            </div>
        </div>
    )
}