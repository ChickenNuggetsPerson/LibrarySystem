'use client'

import { Book } from '@/database/generated/prisma'
import { useState } from 'react'
import BookImage from './BookImage'
import toast from 'react-hot-toast'
import { UploadBookCover } from '@/actions/books/UploadBookCover'
import { useRouter } from 'next/navigation'



export default function BookImageUploader({ book, cb }: { book: Book, cb?: () => void }) {

    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setSelectedFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('bookUUID', book.uuid)

        await toast.promise(async () => {
            setUploading(true)

            await UploadBookCover(formData)

            setSelectedFile(null)
            setPreview(null)

            if (cb) {
                cb()
            }
        }, {
            loading: "Uploading Image",
            success: "Image Uploaded",
            error: (err) => {
                setSelectedFile(null)
                setPreview(null)
                setUploading(false)
                return `${err}`
            }
        })

        setUploading(false)
        router.refresh()
    }

    const disabled = uploading || !selectedFile

    return (
        <div className="card w-sm">


            <div className='flex justify-between w-full gap-4'>
                <div>
                    {preview && <BookImage src={preview} />}
                    {!preview && <BookImage src={book.imageLink} updatedAt={book.imageUpdated} />}
                </div>

                <div className='flex flex-col justify-between'>
                    <label htmlFor="filePicker" className='primary-button cursor-pointer' style={{ backgroundColor: "var(--color-background)" }}>
                        Click to select an image.
                    </label>
                    <button
                        onClick={handleUpload}
                        disabled={disabled}
                        style={{
                            opacity: disabled ? 0.5 : 1
                        }}
                        className="success-button"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>

            <input
                id="filePicker"
                className='hidden'
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                    padding: 15
                }}
            />
        </div>
    )
}
