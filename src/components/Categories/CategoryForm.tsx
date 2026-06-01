'use client'

import { Category } from "@/database/generated/prisma"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { useState } from "react"
import { Field, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import toast from "react-hot-toast"
import upsertCategory from "@/actions/category/upsertCategory"
import { Trash2Icon } from "lucide-react"
import deleteCategory from "@/actions/category/deleteCategory"






function emptyCategory(): Category {
    return {
        name: "",
        color: "#fccf03",
        libraryUUID: "",
        uuid: ""
    }
}

export default function CategoryForm({ category, dismiss }: { category?: Category, dismiss: (refresh: boolean) => void }) {

    const isNew = !category
    const [state, setState] = useState<Category>(category ?? emptyCategory())

    const [confirmDelete, setConfirmDelete] = useState(false)

    async function save() {
        if (isNew) {
            await toast.promise(upsertCategory(state), {
                loading: "Creating Category",
                success: "Category Created",
                error: "Error Creating Category"
            })
        } else {
            await toast.promise(upsertCategory(state), {
                loading: "Updating Category",
                success: "Category Updated",
                error: "Error Updating Category"
            })
        }

        dismiss(true)
    }

    async function deleteCategoryLocal() {

        if (!category) { return }

        setConfirmDelete(false)
        await toast.promise(deleteCategory(category.uuid), {
            loading: "Deleting Category",
            success: "Category Deleted",
            error: "Error Deleting Category"
        })
        dismiss(true)
    }

    return (
        <>
            <AlertDialog open={true}>
                <AlertDialogContent className="gap-1">
                    <AlertDialogTitle>
                        {isNew && "Create Category"}
                        {!isNew && "Edit Category"}
                    </AlertDialogTitle>

                    <div className="flex flex-col gap-3 py-2">

                        <Field className="gap-0">
                            <FieldLabel>Name</FieldLabel>
                            <Input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} placeholder="Category Name" />
                        </Field>

                        <Field className="gap-0">
                            <FieldLabel>Color</FieldLabel>
                            <input value={state.color} onChange={(e) => setState({ ...state, color: e.target.value })} type="color" />
                        </Field>

                    </div>

                    <AlertDialogFooter>
                        {!isNew &&
                            <Button variant={'destructive'} onClick={() => setConfirmDelete(true)} className="mt-5 sm:mt-0">
                                Delete
                            </Button>
                        }

                        <Button onClick={() => { dismiss(false) }} className="ml-auto w-full sm:w-fit">
                            Cancel
                        </Button>
                        <Button variant={'secondary'} onClick={save}>
                            Save
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {state.name} from your library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={deleteCategoryLocal}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}