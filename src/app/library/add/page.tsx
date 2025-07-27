import BookForm from "@/components/Book/BookForm";




export default function AddPage() {

    return (
        <div className="w-full px-10">
            <h1 className="text-text text-2xl font-bold card mb-4 max-w-2xs mx-auto">Add Book:</h1>

            <div className="w-full flex justify-center">
                <BookForm />
            </div>
        </div>
    )
}