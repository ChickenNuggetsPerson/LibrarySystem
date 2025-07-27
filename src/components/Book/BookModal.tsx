import { useRouter } from "next/navigation";
import { ModalProps } from "../Decorative/Modal/Modal";
import { CardProp } from "../Forms/CardProp";
import { BookWithCategories } from "../library/LibraryList";
import { promptUser } from "../Decorative/Modals/promptUser";
import { useModalManager } from "../Decorative/Modal/ModalContext";
import toast from "react-hot-toast";
import deleteBook from "@/actions/books/deleteBook";
import Divider from "../Forms/Divider";




export default function BookModal({ book, pop }: { book: BookWithCategories, push: (modal: ModalProps) => void, pop: () => void }) {

    const { addModal } = useModalManager()
    const router = useRouter()

    async function categoriesClicked() {

    }

    async function editClicked() {
        pop()
        router.push(`/library/edit/${book.uuid}`)
    }

    async function deleteClicked() {
        const answer = await promptUser({
            addModal,
            title: "Are you sure?",
            message: "Are you sure that you want to delete this book?",
            trueButton: {
                title: "Yes, Delete",
                type: "danger"
            },
            falseButton: {
                title: "Cancel",
                type: "primary"
            }
        })

        if (!answer) { return }

        toast.promise(async () => {
            await deleteBook(book.uuid)
            router.refresh()
            pop()
        }, {
            loading: "Deleting Book",
            success: "Book Deleted",
            error: (err) => `${err}`
        })
    }

    return (
        <div>
            <h1 className="text-text font-semibold text-2xl">{book.title}</h1>
            <CardProp label={"Author:"} val={book.author} />
            <CardProp label="ISBN:" val={book.isbn} copyable />
            <div style={{ height: 10 }}></div>

            {book.description.trim() !== "" &&
                <div>
                    <h1>Description: </h1>
                    <div className="bg-background rounded-2xl text-text" style={{ padding: 15 }}>
                        <p>{book.description}</p>
                    </div>
                </div>
            }

            <h1 className="font-semibold text-lg">Categories</h1>
            {book.categories.length == 0 &&
                <h2 className="font-mono">No Categories</h2>
            }
            <ul>
                {book.categories.map((category) => (
                    <li
                        key={category.uuid}
                        className="font-mono"
                        style={{
                            backgroundColor: category.color,
                            padding: 5,
                            borderRadius: 15
                        }}>
                        {category.name}
                    </li>
                ))}
            </ul>

            <Divider mt={15} mb={15}/>

            <div className="flex justify-between gap-4">

                <button className="w-full" onClick={categoriesClicked}>
                    <div className="primary-button text-center">
                        Categories
                    </div>
                </button>
                <button className="w-full" onClick={editClicked}>
                    <div className="secondary-button text-center">
                        Edit
                    </div>
                </button>
                <button className="w-full" onClick={deleteClicked}>
                    <div className="danger-button text-center">
                        Delete
                    </div>
                </button>

            </div>

        </div>
    )
}