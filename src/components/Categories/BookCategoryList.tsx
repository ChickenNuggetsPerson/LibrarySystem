'use client'

import { Category } from "@/database/generated/prisma";
import { BookWithCategories } from "../library/LibraryList";
import ClickableDiv from "../Decorative/ClickableDiv";



export default function BookCategoryList({
    book,
    clickCB
}: {
    book: BookWithCategories,
    clickCB?: (category: Category) => void
}) {

    function clicked(cat: Category) {
        if (clickCB) {
            clickCB(cat)
        }
    }

    return (
        <ul>
            {book.categories.map((category) =>
                <li key={category.uuid} className="w-fit select-none">
                    <ClickableDiv onClick={() => clicked(category)}>
                        <h1 className="smallCard text-center" style={{ backgroundColor: category.color, padding: 5, borderWidth: 2, minWidth: 120 }}>{category.name}</h1>
                    </ClickableDiv>
                </li>
            )}
        </ul>
    )
}