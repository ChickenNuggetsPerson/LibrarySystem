import Link from "next/link";

export default function Header() {

    return (
        <div className="w-full p-4 bg-muted font-bold text-4xl ">
            <Link href={"/"} className="flex flex-row justify-center gap-2">
                <h1 className="text-primary">Library</h1>
                <h1 className="text-secondary">System</h1>
            </Link>
        </div>
    )
}