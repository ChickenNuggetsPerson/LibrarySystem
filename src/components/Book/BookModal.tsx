
import { ModalProps } from "../Decorative/Modal/Modal";
import { CardProp } from "../Forms/CardProp";
import { BookWithCategories } from "../library/LibraryList";
import BookImageUploader from "./BookImageUploader";




export default function BookModal({ book }: { book: BookWithCategories, push: (modal: ModalProps) => void, pop: () => void }) {


    return (
        <div>
            <h1 className="text-text font-semibold text-2xl">{book.title}</h1>
            <CardProp label={"Author:"} val={book.author} />
            <CardProp label="ISBN:" val={book.isbn} copyable />
            <div style={{ height: 10 }}></div>

            {book.description.trim() == "" &&
                <div>
                    <h1>Description: </h1>
                    <div className="bg-background rounded-2xl text-text" style={{ padding: 15 }}>
                        <p>{book.description}</p>
                    </div>
                </div>
            }

            <BookImageUploader book={book} cb={() => {}}/>
        </div>
    )
}