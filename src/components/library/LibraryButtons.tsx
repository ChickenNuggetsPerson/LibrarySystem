import Link from "next/link";
import { Button } from "../ui/button";
import { logout } from "@/auth/actions/Logout";




export default function LibraryButtons() {


    return (
        <div className="flex justify-center gap-2">

            <Link href={'/library/add'}><Button variant={'secondary'}>Add Book</Button></Link>

            <Link href={'/library/categories'}><Button>Categories</Button></Link>

            <Button variant={'destructive'} onClick={logout}>Logout</Button>

        </div>
    )
}