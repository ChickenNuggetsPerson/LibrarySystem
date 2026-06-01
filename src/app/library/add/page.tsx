'use client'


import searchISBN from "@/actions/books/searchISBN";
import BookForm from "@/components/Book/BookForm";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book } from "@/database/generated/prisma";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { BarcodeScanner, DetectedBarcode } from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";
import toast from "react-hot-toast";

enum AddPageState {
    TypeISBN,
    ScanISBN,
    Manual
}

export default function AddPage() {

    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [addState, setAddState] = useState<AddPageState | null>(null)

    const [newBook, setNewBook] = useState<Book | null>(null)

    async function isbnSearch(isbn: string) {
        if (isbn.trim() === "") {
            setAddState(null)
            return
        }
        setLoading(true)
        const book = await searchISBN(isbn)
        if (!book) {
            toast.error(`Could not find book with the ISBN of \n${isbn}`, { duration: 7000 })
            setAddState(null)
            setLoading(false)
            return
        }

        setNewBook(book)
        setLoading(false)
    }

    return (
        <div>
            {!loading && !newBook &&
                <div className="flex justify-center items-center pt-10">
                    {addState !== AddPageState.Manual && <div className="flex gap-3">
                        <Button variant={'secondary'} onClick={() => setAddState(AddPageState.ScanISBN)}>Scan ISBN</Button>
                        <Button onClick={() => setAddState(AddPageState.TypeISBN)}>Type ISBN</Button>
                        <Button variant={'outline'} onClick={() => setAddState(AddPageState.Manual)}>Manual Entry</Button>
                    </div>}

                    {addState === AddPageState.ScanISBN && <ScanModal cb={isbnSearch} />}
                    {addState === AddPageState.TypeISBN && <ManualEntryModal cb={isbnSearch} />}
                    {addState === AddPageState.Manual &&
                        <div className="w-full flex justify-center">
                            <BookForm dismiss={(saved, uuid) => {
                                if (saved) {
                                    router.push(`/library/add/confirm/${uuid}`)
                                } else {
                                    setNewBook(null)
                                    setLoading(false)
                                    setAddState(null)
                                }
                            }} />
                        </div>
                    }

                </div>
            }
            {loading && <div className="animate-pulse text-center text-2xl font-bold pt-20">Searching for Book...</div>}

            {newBook &&
                <div className="pt-2">
                    <div className="w-full flex justify-center mb-4">
                        <h1 className="text-text text-2xl font-bold">New Book:</h1>
                    </div>

                    <div className="w-full flex justify-center">
                        <BookForm book={newBook} dismiss={(saved, uuid) => {
                            if (saved) {
                                router.push(`/library/add/confirm/${uuid}`)
                            } else {
                                setNewBook(null)
                                setLoading(false)
                                setAddState(null)
                            }
                        }} />
                    </div>
                </div>
            }

        </div>
    )
}

function ScanModal({ cb }: { cb: (val: string) => void }) {

    const [percent, setPercent] = useState(0)
    const foundRef = useRef(false)
    const foundCodesRef = useRef(new Map<string, number>())
    const findTime = 500

    const onCapture = useCallback((barcodes: DetectedBarcode[]) => {
        if (foundRef.current) { return }

        const bars = barcodes as (DetectedBarcode & { quality: number })[]
        // bars = bars.filter(b => b.quality > 30).toSorted((a, b) => b.quality - a.quality)
        if (bars.length === 0) { return }

        const chosen = bars[0].rawValue
        if (!chosen) { return }

        const now = Date.now()
        const entry = foundCodesRef.current.get(chosen)

        if (entry === undefined) {
            foundCodesRef.current.set(chosen, now)
            setPercent((prev) => prev === 0 ? prev : 0)
        } else {
            const elapsed = now - entry
            const nextPercent = Math.max(0, Math.min(100, Math.floor((elapsed / findTime) * 100)))
            setPercent((prev) => prev === nextPercent ? prev : nextPercent)

            if (elapsed > findTime) {
                foundRef.current = true
                setPercent(100)
                cb(chosen)
            }
        }
    }, [cb])

    return (
        <AlertDialog open={true}>
            <AlertDialogContent className="gap-1">
                <AlertDialogTitle>
                    Scan Barcode
                </AlertDialogTitle>

                <div>
                    <div className="rounded-xl overflow-clip">
                        <BarcodeScanner
                            options={{
                                delay: 500,
                                formats: ['code_128', 'code_39', 'code_93', 'codabar', 'ean_13', 'ean_8', 'itf', 'upc_a', 'upc_e']
                            }}
                            onCapture={onCapture}
                        />
                    </div>

                    <div className="bg-card rounded-xl shadow-sm overflow-hidden p-1 my-5">
                        <div className="relative h-6 flex items-center justify-center">
                            <div className="absolute top-0 bottom-0 left-0 rounded-lg bg-primary/80" style={{ width: `${percent}%` }} ></div>
                            <div className="relative text-text font-bold text-sm">{percent}%</div>
                        </div>
                    </div>

                </div>

                <AlertDialogFooter>
                    <Button className="w-full" onClick={() => cb("")}>
                        Cancel
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}



function ManualEntryModal({ cb }: { cb: (isbn: string) => void }) {

    const [value, setValue] = useState("")

    return (
        <AlertDialog open={true}>
            <AlertDialogContent>
                <AlertDialogTitle>
                    Enter ISBN
                </AlertDialogTitle>
                <Input placeholder="ISBN Number" value={value} onChange={(e) => setValue(e.target.value)} />
                <AlertDialogFooter>
                    <Button onClick={() => cb("")}>
                        Cancel
                    </Button>
                    <Button variant={'secondary'} onClick={() => cb(value)}>
                        Submit
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}