import getActiveLibraryOrThrow from "@/actions/library/getActiveLibraryOrThrow"
import Link from "next/link"
import Divider from "../Forms/Divider"
import { logout } from "@/auth/actions/Logout"





export function LibraryHeader_Loading() {
    return (
        <div className="card max-w-lg">
            <h1 className="font-bold text-2xl text-text">Loading Library</h1>
        </div>
    )
}

export default async function LibraryHeader() {

    const library = await getActiveLibraryOrThrow()

    return (
        <div className="card max-w-xl w-full">
            <h1 className="font-bold text-2xl text-text">{library.name}</h1>
            <Divider mb={10}/>
            <div className="flex w-full justify-between gap-4">
                <Link href="/library/add" className="w-full">
                    <div className="primary-button text-center">
                        Add Book
                    </div>
                </Link>
                <Link href="/library/categories" className="w-full">
                    <div className="secondary-button text-center">
                        Categories
                    </div>
                </Link>
                <button className="w-full" onClick={logout}>
                    <div className="accent-button text-center">
                        Logout
                    </div>
                </button>
            </div>
        </div>
    )
}