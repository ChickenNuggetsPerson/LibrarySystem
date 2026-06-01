'use client'


import { useState } from "react";



export default function AddPage() {

    return (
        <div>

        </div>
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