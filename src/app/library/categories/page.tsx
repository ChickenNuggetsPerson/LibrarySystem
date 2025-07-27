import CategoryList, { CategoryList_Loading } from "@/components/Categories/CategoryList";
import { Suspense } from "react";








export default function CategoriesPage() {


    return (
        <Suspense fallback={<CategoryList_Loading />}>
            <CategoryList/>
        </Suspense>
    )
}