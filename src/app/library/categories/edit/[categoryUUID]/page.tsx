import getCategoryByUUID from "@/actions/category/getCategoryByUUID";
import CategoryForm from "@/components/Categories/CategoryForm";
import { Suspense } from "react";




export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ categoryUUID: string }>
}) {

    const categoryUUID = (await params).categoryUUID

    return (
        <div>
            <div className="w-full flex justify-center mb-4">
                <h1 className="text-text text-2xl font-bold">Edit Category:</h1>
            </div>

            <div className="w-full flex justify-center">
                <Suspense fallback={<div>Loading...</div>}>
                    <Loader uuid={categoryUUID} />
                </Suspense>
            </div>
        </div>
    )
}

async function Loader({ uuid }: { uuid: string }) {
    const category = await getCategoryByUUID(uuid)
    if (!category) {
        return (
            <div>Error Fetching Category</div>
        )
    }

    return (<CategoryForm category={category}/>)
}