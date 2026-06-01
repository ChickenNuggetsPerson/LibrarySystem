




export default function getLibraryLink(bookUUID: string) {
    return `/library?highlight=%27${bookUUID}%27`
}