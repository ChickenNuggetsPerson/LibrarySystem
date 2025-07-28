'use client'

import { useEffect, useState } from "react";
import Divider from "../Forms/Divider";
import { BookWithCategories } from "../library/LibraryList";
import { Category } from "@/database/generated/prisma";
import getAllCategories from "@/actions/category/getAllCategories";
import CheckboxInput from "../Forms/CheckboxInput";
import toast from "react-hot-toast";
import updateBookCategories from "@/actions/category/updateBookCategories";





export default function BookCategoryEditList({ book, cb }: { book: BookWithCategories, cb?: () => void }) {

    const [bookUUIDs, setBookUUIDS] = useState(book.categories.map((c) => c.uuid))
    const [categories, setCategories] = useState([] as Category[])
    const [loading, setLoading] = useState(false)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        setCategories(await getAllCategories())
        setLoading(false)
    }

    function changeCB(val: string) {
        if (bookUUIDs.includes(val)) {
            setBookUUIDS(bookUUIDs.filter(b => b !== val))
        } else {
            setBookUUIDS([...bookUUIDs, val])
        }
    }

    async function save() {
        await toast.promise(updateBookCategories(book.uuid, bookUUIDs),
            {
                loading: "Updating Categories",
                success: "Categories Updated",
                error: "Error Updating Categories"
            }
        )
        if (cb) {
            cb()
        }
    }

    return (
        <div>
            <h1 className="font-bold">Categories: {book.title}</h1>
            <Divider mt={1} mb={10} />

            {loading &&
                <div>
                    Loading...
                </div>
            }
            {!loading &&
                <div>
                    <button className="w-full" onClick={save}>
                        <div className="primary-button text-center">
                            Save Categories
                        </div>
                    </button>

                    <Divider mt={10} mb={10} />

                    {categories.map((category) => (
                        <div key={category.uuid} className="w-full flex justify-between">
                            <h1 className="font-semibold">{category.name}</h1>
                            <CheckboxInput val={bookUUIDs.includes(category.uuid)} changeCB={() => changeCB(category.uuid)} />
                        </div>
                    ))}
                </div>
            }


        </div>
    )
}