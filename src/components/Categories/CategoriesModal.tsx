'use client'


import getAllCategories from "@/actions/category/getAllCategories"
import updateBookCategories from "@/actions/category/updateBookCategories"
import { Book, Category } from "@/database/generated/prisma"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import getBookByUUID from "@/actions/books/getBookByUUID"



export default function CategoriesModal({ book, refresh }: { book: Book, refresh: () => void }) {

    const [open, setOpen] = useState(false)
    const [libCats, setLibCats] = useState<Category[]>([])
    const [selectedCats, setSelectedCats] = useState(new Set<string>())

    useEffect(() => {
        getBookByUUID(book.uuid).then(b => {
            if (!b) { return }
            setSelectedCats(new Set(b.categories.map(c => c.uuid)))
        })
    }, [book])

    useEffect(() => {
        getAllCategories().then(setLibCats)
    }, [])

    async function save() {
        await toast.promise(updateBookCategories(book.uuid, Array.from(selectedCats)), {
            loading: "Saving",
            success: "Categories Updated",
            error: "An error occurred while updating categories."
        })
        setOpen(false)
        refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'secondary'}>
                    Edit Categories
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[70dvh] overflow-scroll">
                <DialogHeader>
                    <DialogTitle>Categories</DialogTitle>
                </DialogHeader>

                <ul>
                    {libCats.map(category => (
                        <li
                            key={category.uuid}
                            style={{ color: category.color }}
                            className="flex gap-2 items-center pb-2 text-wrap"
                        >
                            <Checkbox
                                id={`${category.uuid}-checkbox`}
                                checked={selectedCats.has(category.uuid)}
                                onCheckedChange={() => {
                                    const newSet = new Set(selectedCats)
                                    if (newSet.has(category.uuid)) {
                                        newSet.delete(category.uuid)
                                    } else {
                                        newSet.add(category.uuid)
                                    }
                                    setSelectedCats(newSet)
                                }}
                            />
                            <Label htmlFor={`${category.uuid}-checkbox`}>
                                {category.name}
                            </Label>
                        </li>
                    ))}
                </ul>

                <DialogFooter className="flex flex-row justify-between sticky -bottom-4 bg-card">
                    <DialogClose asChild>
                        <Button className="w-1/2">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button variant={'secondary'} onClick={save} className="w-1/2">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}