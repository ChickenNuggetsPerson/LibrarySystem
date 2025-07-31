import getAllCategories from "@/actions/category/getAllCategories"
import Link from "next/link"
import Divider from "../Forms/Divider"
import getActiveLibraryOrThrow from "@/actions/library/getActiveLibraryOrThrow"





export function CategoryList_Loading() {
    return (
        <div className="card w-full max-w-lg">

            <div className="flex mb-2">
                <h1 className="font-bold text-2xl pr-2">Categories:</h1>
                <h1 className="font-semibold text-2xl text-text/70 animate-pulse">Loading...</h1>
            </div>
            <div className="flex justify-between w-full gap-4">

                <Link href="/library" className="w-full">
                    <div className="accent-button text-center">
                        Back
                    </div>
                </Link>

                <Link href="/library/categories/new" className="w-full">
                    <div className="primary-button text-center">
                        New Category
                    </div>
                </Link>


            </div>

            <Divider mt={15} mb={15} />
            
        </div>
    )
}

export default async function CategoryList() {

    const library = await getActiveLibraryOrThrow()
    const categories = await getAllCategories()

    return (
        <div className="card w-full max-w-lg">

            <div className="flex mb-2">
                <h1 className="font-bold text-2xl pr-2">Categories:</h1>
                <h1 className="font-semibold text-2xl text-text/70">{library.name}</h1>
            </div>
            <div className="flex justify-between w-full gap-4">

                <Link href="/library" className="w-full">
                    <div className="accent-button text-center">
                        Back
                    </div>
                </Link>

                <Link href="/library/categories/new" className="w-full">
                    <div className="primary-button text-center">
                        New Category
                    </div>
                </Link>


            </div>

            <Divider mt={15} mb={15} />

            {categories.map((category) =>
                <Link key={category.uuid} className="w-full flex justify-between smallCard" href={`/library/categories/edit/${category.uuid}`}>
                    <h1 className="primary-button" style={{ backgroundColor: category.color, borderRadius: 10 }}>{category.name}</h1>
                    <h2 className="text-text font-semibold text-xl pt-2 pr-2">{`${category._count.books} Books`}</h2>
                </Link>
            )}

            {categories.length == 0 &&
                <div className="flex w-full justify-center">
                    <h1 className="text-text text-lg font-semibold">- No Categories -</h1>
                </div>
            }
        </div>
    )
}