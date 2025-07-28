'use client'

import { Category } from "@/database/generated/prisma"
import { useState } from "react"
import TextInput from "../Forms/TextInput"
import Link from "next/link"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import upsertCategory from "@/actions/category/upsertCategory"
import ColorInput from "../Forms/ColorInput"
import { useModalManager } from "../Decorative/Modal/ModalContext"
import { promptUser } from "../Decorative/Modals/promptUser"
import deleteCategory from "@/actions/category/deleteCategory"



function emptyCategory(): Category {
    return {
        name: "",
        uuid: "",
        color: "var(--color-primary)",
        libraryUUID: ""
    }
}


export default function CategoryForm({ category }: { category?: Category }) {

    const router = useRouter()
    const [state, setState] = useState(category ?? emptyCategory())
    const { addModal } = useModalManager()

    async function save() {
        await toast.promise(upsertCategory(state), {
            loading: "Saving Category",
            success: "Category Saved",
            error: "Error Saving Category"
        })

        router.push("/library/categories")
    }

    async function deleteCat() {
        if (!category) { return }

        const answer = await promptUser({
            addModal: addModal,
            title: "Are you sure?",
            message: "Are you sure that you want to delete this category?",
            trueButton: {
                title: "Yes, Delete",
                type: "danger"
            },
            falseButton: {
                title: "Cancel",
                type: "primary"
            }
        })

        if (!answer) { return }

        toast.promise(async () => {
            await deleteCategory(category.uuid)
            router.push("/library/categories")
        }, {
            loading: "Deleting Category",
            success: "Category Deleted",
            error: "Error Deleting Category"
        })
    }

    return (
        <div className="card w-sm">

            <TextInput label="Name" val={state.name} onChange={(val) => setState({ ...state, name: val })} />
            <ColorInput label="Color" val={state.color} onChange={(val) => setState({ ...state, color: val })} />

            <div style={{ height: 10 }}></div>

            {category &&
                <button className="w-full mb-5" onClick={deleteCat}>
                    <div className="danger-button text-center">
                        Delete Category
                    </div>
                </button>
            }

            <div className="flex justify-between w-full gap-4">

                <Link href={"/library/categories"} className="w-full">
                    <div className="accent-button text-center">
                        Cancel
                    </div>
                </Link>

                <button className="w-full" onClick={save}>
                    <div className="primary-button text-center">
                        Save Changes
                    </div>
                </button>


            </div>
        </div>
    )
}