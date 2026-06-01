'use client'

import getLibraryBooks, { BookWithCategories, LibrarySearchResult } from "@/actions/books/getLibraryBooks";
import { DataTable } from "../DataTable";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import BookImage from "../Book/BookImage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "../ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlState } from "state-in-url";
import { ArrowLeft, ArrowRight, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import getBookByUUID from "@/actions/books/getBookByUUID";
import getAllCategories from "@/actions/category/getAllCategories";
import { Category } from "@/database/generated/prisma";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import toast from "react-hot-toast";
import updateBookCategories from "@/actions/category/updateBookCategories";
import Link from "next/link";
import { setLastSearchURL } from "./SearchHistory";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "../ui/alert-dialog";
import deleteBook from "@/actions/books/deleteBook";





export default function LibraryTable() {

    const isMobile = useIsMobile()
    const searchParms = useSearchParams()
    const pathname = usePathname()

    const [result, setResult] = useState<LibrarySearchResult>({ books: [], totalResults: 0 })
    const [selectedBook, setSelectedBook] = useState<BookWithCategories | null>(null)

    const lastSearch = useRef<SearchState>({ search: "", pageIndex: 0, pageSize: 15 })

    const sendSearch = useDebounce((searchState?: SearchState) => {
        if (!searchState) {
            getLibraryBooks(lastSearch.current.search, lastSearch.current.pageIndex, lastSearch.current.pageSize).then(setResult)
        } else {
            getLibraryBooks(searchState.search, searchState.pageIndex, searchState.pageSize).then(setResult)
            lastSearch.current = searchState
        }
    }, 500)

    const columns: ColumnDef<BookWithCategories>[] = [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }) => {
                return (
                    <BookImage reactKey={`${row.original.uuid}-image`} src={row.original.imageLink} updatedAt={row.original.imageUpdated} hoverable={false} />
                )
            },
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => {
                return (
                    <div className="font-semibold text-lg text-wrap">
                        {row.original.title}
                    </div>
                )
            }
        },
        ...(isMobile ? [] : [
            {
                accessorKey: "author",
                header: "Author",
                cell: ({ row }: { row: Row<BookWithCategories> }) => {

                    return (
                        <div className="text-wrap">{row.original.author}</div>
                    )
                },
            }
        ]),
        {
            accessorKey: "categories",
            header: "Categories",
            cell: ({ row }) => {

                return (
                    <div className="pl-2">
                        {row.original.categories.map((category, index) => (
                            <li key={`${row.original.uuid}-cat-${index}`} className="text-secondary font-semibold text-wrap" style={{ color: category.color }}>
                                {category.name}
                            </li>
                        ))}
                    </div>
                )
            },
        }
    ]

    function refresh() {
        sendSearch(true)
        if (selectedBook) {
            getBookByUUID(selectedBook.uuid).then(book => setSelectedBook(book))
        }
    }

    useEffect(() => {
        setLastSearchURL(`${pathname}?${searchParms.toString()}`)
    }, [pathname, searchParms])

    return (
        <div className="flex flex-col gap-4 sm:px-10">

            <SearchBar cb={(noDb, state) => sendSearch(noDb, state)} visibleCount={result.books.length} totalResults={result.totalResults} />

            <DataTable
                columns={columns}
                data={result.books}
                rowClicked={(row) => {
                    getBookByUUID(row.uuid).then(book => setSelectedBook(book))
                }}
            />

            {selectedBook && <BookModal book={selectedBook} dismiss={() => setSelectedBook(null)} refresh={refresh} />}
        </div>
    )

}


type SearchState = { search: string, pageIndex: number, pageSize: number }
export function SearchBar({ cb, visibleCount, totalResults }: { cb: (noDB: boolean, state: SearchState) => void, visibleCount: number, totalResults: number }) {

    const { urlState, setUrl } = useUrlState<SearchState>({ search: "", pageIndex: 0, pageSize: 15 });

    useEffect(() => {
        cb(false, urlState)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlState])

    function left() {
        if (urlState.pageIndex <= 0) { return }
        setUrl({ ...urlState, pageIndex: urlState.pageIndex - 1 })
    }
    function right() {
        if (urlState.pageIndex >= Math.trunc(totalResults / urlState.pageSize)) { return }
        setUrl({ ...urlState, pageIndex: urlState.pageIndex + 1 })
    }

    return (
        <div className="w-full flex flex-col sm:flex-row gap-1 sm:gap-4 justify-between items-center">
            <Input placeholder="Search Books" value={urlState.search} onChange={(e) => setUrl({ ...urlState, search: e.target.value, pageIndex: 0 })} />

            <div className="text-nowrap">
                {`Showing ${urlState.pageIndex * urlState.pageSize + 1} - ${urlState.pageIndex * urlState.pageSize + visibleCount} of ${totalResults} Books`}
            </div>

            <div className="flex gap-1">
                <Button onClick={left} variant={'secondary'}><ArrowLeft /></Button>
                <Button onClick={right} variant={'secondary'}><ArrowRight /></Button>
            </div>
        </div>
    )
}


function BookModal({ book, dismiss, refresh }: { book: BookWithCategories, dismiss: () => void, refresh: () => void }) {

    const [deleteOpen, setDeleteOpen] = useState(false)
    async function deleteBookClient() {
        await toast.promise(deleteBook(book.uuid), {
            loading: "Deleting Book",
            success: "Book Deleted",
            error: "Error Deleting Book"
        })
        dismiss()
        refresh()
    }

    return (
        <>
            <Dialog
                open
                onOpenChange={(open) => {
                    if (!open) {
                        dismiss()
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{book.title}</DialogTitle>
                        <DialogDescription>{book.author}</DialogDescription>
                    </DialogHeader>
                    <div>
                        {book.description}
                    </div>

                    <div>
                        <div className="text-muted-foreground font-semibold">
                            Categories:
                        </div>
                        <ul>
                            {book.categories.map((c, i) => (
                                <li key={`modal-cat-${i}`} style={{ color: c.color }}>- {c.name}</li>
                            ))}
                            {book.categories.length === 0 && <li>No Categories</li>}
                        </ul>
                    </div>

                    <DialogFooter>
                        <Button variant={'destructive'} className="sm:mr-auto" onClick={() => setDeleteOpen(true)}>
                            Delete
                        </Button>

                        <Link href={`/library/edit/${book.uuid}`} className="w-full sm:w-fit">
                            <Button className="w-full">
                                Edit Book
                            </Button>
                        </Link>
                        <CategoriesModal book={book} refresh={refresh} />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Delete Book?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {book.title} from your library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={deleteBookClient}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function CategoriesModal({ book, refresh }: { book: BookWithCategories, refresh: () => void }) {

    const [open, setOpen] = useState(false)
    const [libCats, setLibCats] = useState<Category[]>([])
    const [selectedCats, setSelectedCats] = useState(new Set<string>(book.categories.map(c => c.uuid)))

    useEffect(() => {
        setSelectedCats(new Set(book.categories.map(c => c.uuid)))
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
                    Categories
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Categories</DialogTitle>
                </DialogHeader>

                <ul>
                    {libCats.map(category => (
                        <li
                            key={category.uuid}
                            style={{ color: category.color }}
                            className="flex gap-1 items-center"
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

                <DialogFooter className="flex flex-row justify-between">
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