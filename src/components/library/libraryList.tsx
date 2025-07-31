'use client'

import getLibraryBooks from "@/actions/books/getLibraryBooks"
import { ColumnFilter, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortDirection, useReactTable } from "@tanstack/react-table";
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
import SelectInput from "../Forms/SelectInput";
import BookCategoryList from "../Categories/BookCategoryList";
import toast from "react-hot-toast";



export type BookWithCategories = Prisma.BookGetPayload<{ include: { categories: true } }>

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
        header: "Author"
    },
    {
        accessorKey: "categories",
        header: "Categories",
        filterFn: (row: Row<BookWithCategories>, columnId: string, filterValue: string) => {
            if (filterValue.trim() == "") { // Empty search bar shows all books
                return true
            }

            const cs = row.original.categories.map(m => m.name.toLowerCase().trim())
            for (let i = 0; i < cs.length; i++) {
                const category = cs[i]
                if (category.includes(filterValue.toLowerCase())) {
                    return true
                }
            }
            return false
        },
    }

]

const searchByOptions = [
    { id: "title", label: "Title" },
    { id: "author", label: "Author" },
    { id: "categories", label: "Category" }
]

export default function LibraryList() {

    const { addModal } = useModalManager()

    const [books, setBooks] = useState([] as BookWithCategories[])
    const [columnFilters, setColumnFilters] = useState([] as ColumnFilter[])
    const [sorting] = useState([
        { id: 'title', desc: false }, // default sort: title ascending
    ]);

    const { urlState, setUrl } = useUrlState({
        search: "",
        highlight: "",
        searchBy: searchByOptions[0].id
    });

    useEffect(() => {
        load()
    }, [])
    async function load() {
        const loadingID = toast.loading("Loading Library")
        setBooks(await getLibraryBooks())
        toast.dismiss(loadingID)

    }

    const table = useReactTable({
        data: books,
        columns: colums,
        state: {
            columnFilters,
            sorting,
            columnVisibility: {
                author: false,
            },
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        columnResizeMode: "onChange"
    })

    useEffect(() => { // On change of search state
        setColumnFilters([
            { id: urlState.searchBy, value: urlState.search },
        ])
    }, [urlState.search, urlState.searchBy])

    function setSearch(search: string) {
        setUrl({
            highlight: "",
            search: search
        })
    }

    function clickBook(b: BookWithCategories) {
        setUrl({ highlight: b.uuid })
        addModal({
            component: (push, pop) => (<BookModal book={b} push={push} pop={pop} refreshCB={load} />)
        })
    }

    useEffect(() => {
        table.setPageSize(50)
        if (!urlState.highlight || books.length === 0) return;

        // Find the index of the book
        const bookIndex = books.findIndex(b => b.uuid === urlState.highlight);
        if (bookIndex === -1) return;

        const pageSize = table.getState().pagination.pageSize;
        const pageIndex = Math.floor(bookIndex / pageSize);

        // If already on correct page, skip page change
        if (table.getState().pagination.pageIndex !== pageIndex) {
            table.setPageIndex(pageIndex);
        }

        // Wait until the page is actually rendered
        const timeout = setTimeout(() => {
            const el = document.getElementById(`book-${urlState.highlight}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 500); // slight delay to ensure rendering

        return () => clearTimeout(timeout);
    }, [books, urlState.highlight, table]);

    const line1 = `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`
    const line2 = `Showing ${table.getRowModel().rows.length} of ${books.length} Total Entries`

    return (
        <div className="">

            <div className={`md:flex md:justify-between gap-10 card max-w-xl mx-auto`} style={{ padding: 15 }}>
                <div className="w-full md:w-1/2 mt-2 flex gap-4">
                    <TextInput label="Search" val={urlState.search} onChange={(val) => { setSearch(val) }} />
                    <SelectInput label="Search By:" val={urlState.searchBy} options={searchByOptions} changeCB={(val) => { setUrl({ searchBy: val }) }} />
                </div>

                <div className="flex justify-start max-w-md select-none">
                    <ChevronLeft strokeWidth={1.5} onClick={() => { if (table.getCanPreviousPage()) { table.previousPage() } }} className="mr-1" />
                    <ChevronRight strokeWidth={1.5} onClick={() => { if (table.getCanNextPage()) { table.nextPage() } }} className="mr-5" />

                    <NumericText val={line1} spacing={-7} animDelta={0} />
                </div>
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
                                id={`book-${row.original.uuid}`}

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
                                            <div className="pl-5 py-1">
                                                <BookImage src={cell.getValue() as string} updatedAt={row.original.imageUpdated} />
                                            </div>
                                        }
                                        {cell.column.id == "title" &&
                                            <p>{cell.getValue() as string}</p>
                                        }
                                        {cell.column.id == "categories" &&
                                            <BookCategoryList book={cell.row.original} />
                                        }
                                    </td>
                                ))}

                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>


            <div className="ml-2">
                <NumericText val={line2} spacing={-7} animDelta={0} />
            </div>

        </div>
    )
}