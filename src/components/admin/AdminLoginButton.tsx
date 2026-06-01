import { getSession } from "@/auth/auth";
import Link from "next/link";





export default async function AdminLoginButton() {
    const session = await getSession()
    if (!session) {
        return (<></>)
    }
    if (session.isAdmin) {
        return (<></>)
    }

    return (
        <div className="fixed bottom-5 right-5">
            <Link href="/auth/login">
                <div className="secondary-button text-center">
                    Admin Login
                </div>
            </Link>
        </div>
    )
}