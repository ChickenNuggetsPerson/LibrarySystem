'use client'

import { useEffect, useState } from "react"
import { DataTable } from "../DataTable"
import { ColumnDef } from "@tanstack/react-table"
import getAllCategories, { CategoryWithTotal } from "@/actions/category/getAllCategories"
import { Category } from "@/database/generated/prisma"
import CategoryForm from "./CategoryForm"
import { Button } from "../ui/button"
import Link from "next/link"
import { getCategoryFilterLink } from "../library/LibraryTable"
import { Pen } from "lucide-react"




export default function CategoriesList() {

    const [categories, setCategories] = useState<CategoryWithTotal[]>([])
    useEffect(() => {
        getAllCategories().then(setCategories)
    }, [])

    const [newCategory, setNewCategory] = useState(false)
    const [editCategory, setEditCategory] = useState<Category | null>(null)

    const columns: ColumnDef<CategoryWithTotal>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                return (
                    <div style={{ color: row.original.color }} className="font-semibold text-wrap">
                        {row.original.name}
                    </div>
                )
            },
        },
        {
            accessorKey: "total",
            header: "Total Books",
            cell: ({ row }) => {
                return (
                    <div>
                        {row.original._count.books}
                    </div>
                )
            },
        },
        {
            accessorKey: "books",
            header: "Books",
            cell: ({ row }) => {
                return (
                    <Link onClick={(e) => e.stopPropagation()} href={getCategoryFilterLink(row.original.uuid)}>
                        <Button variant={'secondary'}>Books</Button>
                    </Link>
                )
            },
        },
        {
            accessorKey: "edit",
            header: "Edit",
            cell: ({ }) => {
                return (
                    <Button><Pen /> Edit</Button>
                )
            },
        }
    ]

    return (<>
        <div className="flex justify-center gap-2">

            <Link href={'/library'}><Button variant={'secondary'}>Library</Button></Link>

            <Button onClick={() => setNewCategory(true)}>New Category</Button>

        </div>

        <div className="flex flex-col gap-4 sm:px-10">
            <div className="w-full flex justify-center mb-4">
                <h1 className="text-text text-2xl font-bold">Categories:</h1>
            </div>
            <DataTable data={categories} columns={columns} rowClicked={(row) => setEditCategory(row)} />
            {editCategory && <CategoryForm category={editCategory} dismiss={(refresh) => {
                setEditCategory(null)
                if (refresh) {
                    getAllCategories().then(setCategories)
                }
            }} />}
            {newCategory && <CategoryForm dismiss={(refresh) => {
                setNewCategory(false)
                if (refresh) {
                    getAllCategories().then(setCategories)
                }
            }} />}
        </div>
    </>)
}