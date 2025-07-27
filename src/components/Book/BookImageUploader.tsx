'use client'

import { Book } from '@/database/generated/prisma'
import { useState } from 'react'
import BookImage from './BookImage'
import toast from 'react-hot-toast'
import { UploadBookCover } from '@/actions/books/UploadBookCover'



export default function BookImageUploader({ book, cb }: { book: Book, cb?: () => void }) {
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

            const link = await UploadBookCover(formData)

            setSelectedFile(null)
            setPreview(link)

            if (cb) {
                cb()
            }
        }, {
            loading: "Uploading Image",
            success: "Image Uploaded",
            error: "Error Uploading Image"
        })
        
        setUploading(false)
    }

    const disabled = uploading || !selectedFile

    return (
        <div className="card w-md">


            <div className='flex justify-between w-full'>
                {preview && <BookImage src={preview} />}
                {!preview && <BookImage src={book.imageLink} />}

                <input
                    className='card font-mono font-bold w-full text-wrap'
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                        padding: 15
                    }}
                />
            </div>

            <button
                onClick={handleUpload}
                disabled={disabled}
                style={{
                    opacity: disabled ? 0.5 : 1
                }}
                className="primary-button"
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    )
}
