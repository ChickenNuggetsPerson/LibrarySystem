
import LibraryHeader, { LibraryHeader_Loading } from "@/components/library/LibraryHeader"
import LibraryList from "@/components/library/LibraryList"
import { Suspense } from "react"




export default function LibraryPage() {

    return (
        <div className="px-10">
            <div className="w-full flex justify-center">
                <Suspense fallback={<LibraryHeader_Loading />}>
                    <LibraryHeader />
                </Suspense>
            </div>

            <div style={{ height: 10 }}></div>

            <LibraryList />
        </div>
    )
}