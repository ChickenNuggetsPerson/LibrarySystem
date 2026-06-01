'use client'

import { BookWithCategories } from "@/actions/books/getLibraryBooks";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import BookImageUploader from "./BookImageUploader";
import CategoriesModal from "../Categories/CategoriesModal";
import Link from "next/link";
import { Button } from "../ui/button";



export default function BookConfirmCard({ book }: { book: BookWithCategories }) {
    return (
        <div className="flex flex-col gap-4">

            <div className="w-fit font-semibold">
                Cover Image:
                <BookImageUploader book={book} />
            </div>

            <Card>
                <CardHeader className="font-semibold">
                    Book Categories:
                </CardHeader>
                <CardContent>

                    <ul className="pl-2">
                        {book.categories.map((category, index) => (
                            <li
                                key={`$cat-${index}`}
                                className="text-secondary font-semibold text-wrap"
                                style={{ color: category.color }}
                            >
                                - {category.name}
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <CategoriesModal book={book} refresh={() => { }} />
                </CardFooter>
            </Card>

            <Link href={'/library'} className="ml-auto">
                <Button>
                    Done
                </Button>
            </Link>
        </div>
    )
}