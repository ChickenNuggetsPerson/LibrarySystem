
'use server'



import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/database/prisma'
import getActiveLibraryOrThrow from '../library/getActiveLibraryOrThrow'


const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 35 * 1024 * 1024 // 5MB

export async function UploadBookCover(formData: FormData) {
    const file = formData.get('file') as File
    const bookUUID = formData.get("bookUUID") as string

    if (!file || !bookUUID) {
        throw new Error("Invalid Parms")
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Unsupported file type')
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large')
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        throw new Error('Invalid file extension')
    }

    const library = await getActiveLibraryOrThrow()
    const book = await prisma.book.findUniqueOrThrow({ where: { uuid: bookUUID, libraryuuid: library.uuid } })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${bookUUID}.${ext}`
    const filePath = path.join(process.cwd(), 'uploads', fileName)

    const dbFilePath = path.join('./', 'uploads', fileName)

    await writeFile(filePath, buffer)

    const imageLink = `/library/book/cover/${book.uuid}`
    await prisma.book.update({
        where: { uuid: book.uuid },
        data: {
            imageLink: imageLink,
            imagePath: dbFilePath,
            imageUpdated: new Date(),
            imageFileType: file.type,
        }
    })

    console.log("Saved image:", imageLink)

    return {
        link: imageLink,
        updateAt: new Date()
    }
}
