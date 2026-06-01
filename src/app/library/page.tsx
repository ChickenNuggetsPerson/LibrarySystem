import LibraryButtons from "@/components/library/LibraryButtons"
import LibraryTable from "@/components/library/LibraryTable"
import { Suspense } from "react"



export default function LibraryPage() {

    return (
        <div className="flex flex-col gap-4 pt-8 pb-20">
            
            <LibraryButtons />

            <Suspense>
                <LibraryTable />
            </Suspense>
            
        </div>
    )
}