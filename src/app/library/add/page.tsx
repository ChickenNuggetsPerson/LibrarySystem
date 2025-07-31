'use client'


import { emptyBook } from "@/actions/books/emptyBook";
import searchISBN from "@/actions/books/searchISBN";
import BookForm from "@/components/Book/BookForm";
import AnimateChildren from "@/components/Decorative/AnimateChildren";
import { useModalManager } from "@/components/Decorative/Modal/ModalContext";
import { promtTextInput } from "@/components/Decorative/Modals/promtTextInput";
import Divider from "@/components/Forms/Divider";
import { Book } from "@/database/generated/prisma";
import { useState } from "react";
import toast from "react-hot-toast";



export default function AddPage() {

    const { addModal } = useModalManager()
    const [book, setBook] = useState(null as Book | null)

    function scanBtn() {
        addModal({
            title: "Scan ISBN",
            component: (push, pop) => (<ScanModal cb={(val) => {
                pop()
                if (val.trim() == "") { return }
                lookupISBN(val)
            }} />)
        })
    }
    async function typeBtn() {
        const result = await promtTextInput({
            addModal,
            title: "Enter ISBN",
            message: "Type in the book's ISBN number."
        })

        if (result.trim() == "") { return }
        lookupISBN(result)
    }
    function manualBtn() { setBook(emptyBook()) }


    function lookupISBN(isbn: string) {
        toast.promise(async () => {
            const b = await searchISBN(isbn)
            if (!b) {
                setBook(emptyBook())
                throw new Error("")
            }
            setBook(b)
        }, {
            loading: "Fetching Book Data",
            success: "Book Data Found",
            error: "Error Fetching Book Data"
        })
    }

    return (
        <>

            {!book &&
                <div className="card max-w-lg w-full">
                    <h1 className="text-text text-2xl font-bold">New Book:</h1>
                    <Divider mb={10} />
                    <div className="flex w-full justify-between gap-4">
                        <button className="w-full" onClick={scanBtn}>
                            <div className="primary-button text-center">
                                Scan ISBN
                            </div>
                        </button>
                        <button className="w-full" onClick={typeBtn}>
                            <div className="secondary-button text-center">
                                Type ISBN
                            </div>
                        </button>
                        <button className="w-full" onClick={manualBtn}>
                            <div className="accent-button text-center">
                                Manual
                            </div>
                        </button>
                    </div>
                </div>
            }

            {book &&
                <AnimateChildren y={-20}>
                    <div className="w-full flex justify-center">
                        <h1 className="text-text text-2xl font-bold">Enter Book Data:</h1>
                    </div>
                    <BookForm book={book} isNew />
                </AnimateChildren>
            }


        </>
    )
}





import { BarcodeScanner, DetectedBarcode } from 'react-barcode-scanner'
import 'react-barcode-scanner/polyfill'

function ScanModal({ cb }: { cb: (val: string) => void }) {

    const [found, setFound] = useState(false)
    const [foundCodes, setFoundCodes] = useState(new Map<string, Date>())
    const findTime = 500

    function onCapture(barcodes: DetectedBarcode[]) {
        if (found) { return }

        let bars = barcodes as (DetectedBarcode & { quality: number })[]
        bars = bars.filter(b => b.quality > 30).toSorted((a, b) => b.quality - a.quality)
        if (bars.length == 0) { return }

        const chosen = bars[0].rawValue
        const newMap = structuredClone(foundCodes)
        const entry = newMap.get(chosen)

        if (!entry) {
            newMap.set(chosen, new Date())
        } else {
            if (new Date().getTime() - entry.getTime() > findTime) {
                setFound(true)
                cb(chosen)
            }
        }

        setFoundCodes(newMap)
    }

    const now = new Date()
    const highest = foundCodes.values().map(v => now.getTime() - v.getTime()).toArray().toSorted().toReversed()
    let percent = 0
    if (highest.length !== 0) {
        percent = Math.floor((highest[0] / findTime) * 100)
    }

    return (
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

            <div className="bg-card-down rounded-xl shadow-sm overflow-hidden p-1 my-5">
                <div className="relative h-6 flex items-center justify-center">
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg bg-primary/80" style={{ width: `${percent}%` }} ></div>
                    <div className="relative text-text font-bold text-sm">{percent}%</div>
                </div>
            </div>

            <button className="accent-button w-full" onClick={() => cb("")}>
                Cancel
            </button>
        </div>
    )
}