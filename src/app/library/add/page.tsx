import BookForm from "@/components/Book/BookForm";




export default function AddPage() {

    return (
        <div className="w-full">
            <div className="w-full flex justify-center mb-4">
                <h1 className="text-text text-2xl font-bold">Edit Book:</h1>
            </div>

            <div className="w-full flex justify-center">
                <BookForm />
            </div>
        </div>
    )
}