'use client'

import getLibraryBooks from "@/actions/books/getLibraryBooks"
import { ColumnFilter, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortDirection, useReactTable } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import NumericText from "../Decorative/NumericText/NumericText";
import TextInput from "../Forms/TextInput";
import { useUrlState } from "state-in-url";
import BookImage from "../Book/BookImage";
import { useModalManager } from "../Decorative/Modal/ModalContext";
import BookModal from "../Book/BookModal";
import { Prisma } from "@/database/generated/prisma";



export type BookWithCategories = Prisma.BookGetPayload<{ include: { categories: true } }>

export default function LibraryList() {

    const { addModal } = useModalManager()

    const [books, setBooks] = useState([] as BookWithCategories[])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        load()
    }, [])

    async function load() {
        setLoading(true)
        setBooks(await getLibraryBooks())
        setLoading(false)
    }


    const [columnFilters, setColumnFilters] = useState([] as ColumnFilter[])
    const { urlState, setUrl } = useUrlState({
        search: "",
        highlight: ""
    });
    const colums = [
        {
            accessorKey: "imageLink",
            header: "Image",
        },
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "author",
            header: "Author",
        },
        {
            accessorKey: "categories",
            header: "Categories",
        }

    ]
    const table = useReactTable({
        data: books,
        columns: colums,
        state: {
            columnFilters
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        columnResizeMode: "onChange"
    })

    useEffect(() => {
        setColumnFilters([
            { id: 'title', value: urlState.search },
            // { id: 'author', value: urlState.search }
        ])
    }, [urlState.search])

    function clickBook(b: BookWithCategories) {
        setUrl({ highlight: b.uuid })
        addModal({
            component: (push, pop) => (<BookModal book={b} push={push} pop={pop}/>)
        })
    }


    return (
        <div className="">

            <div className={`md:flex md:justify-between gap-10 card max-w-xl mx-auto`} style={{ padding: 15 }}>
                <div className="w-full md:w-1/2 mt-2">
                    <TextInput label="Search" val={urlState.search} onChange={(val) => { setUrl({ search: val }) }} />
                </div>

                {loading && <div className="my-2"> Loading... </div>}
                {!loading && <div className="flex justify-start max-w-md select-none mt-5">
                    <ChevronLeft strokeWidth={1.5} onClick={() => { if (table.getCanPreviousPage()) { table.previousPage() } }} className="mr-1" />
                    <ChevronRight strokeWidth={1.5} onClick={() => { if (table.getCanNextPage()) { table.nextPage() } }} className="mr-5" />

                    <NumericText val={`Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`} spacing={-7} animDelta={0} />
                </div>}
            </div>

            <table className="w-full table-fixed card my-5">
                <thead>
                    {table.getHeaderGroups().map((group) => (
                        <tr key={group.id}>
                            {group.headers.map((header) => (
                                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                    <div className="flex flex-row justify-center select-none">

                                        {header.column.columnDef.header?.toString()}

                                        <div className="scale-70">
                                            {{
                                                asc: <ArrowUp />,
                                                desc: <ArrowDown />,
                                            }[header.column.getIsSorted() as SortDirection]}
                                        </div>

                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody>
                    <AnimatePresence>
                        {table.getRowModel().rows.map((row) => (
                            <motion.tr
                                key={row.id}

                                initial={{ opacity: 1, height: 0, fontSize: 0, borderWidth: "0px" }}
                                animate={{ 
                                    opacity: 1, 
                                    height: 40, 
                                    fontSize: "15px", 
                                    borderWidth: "1px"
                                }}
                                exit={{ opacity: 1, height: 0, fontSize: 0, border: 0, borderColor: "white" }}

                                // transition={{ duration: 0.3, type: 'linear', delay: (i * 0.05) }}

                                className={`cursor-pointer select-none overflow-y-clip bg-card border border-card-up shadow-sm hover:bg-card-up ${row.original.uuid == urlState.highlight ? "bg-secondary/50" : ""}`}
                                onClick={() => {
                                    clickBook(row.original)
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td className="text-center" key={cell.id}>
                                        {cell.column.id == "imageLink" &&
                                            <div>
                                                <BookImage src={cell.getValue() as string} />
                                            </div>
                                        }
                                        {cell.column.id !== "imageLink" &&
                                            <p>{cell.getValue() as string}</p>
                                        }
                                    </td>
                                ))}

                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>


            </table>
        </div>
    )
}