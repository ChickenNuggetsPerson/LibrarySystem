import { getSession } from "@/auth/auth"
import Link from "next/link"
import Divider from "./Forms/Divider"
import { logout } from "@/auth/actions/Logout"
import LoadingBlock from "./Decorative/LoadingBlock"




export function WelcomeCard_Loading() {
    return (
        <div className="card w-xs">
            <h1 className="font-bold text-xl">Loading...</h1>
            <Divider mb={15} />
            
            <LoadingBlock w={40} h={5}/>
            <LoadingBlock w={40} h={5} style={{marginBottom: 5, marginTop: 5}}/>
            <LoadingBlock w={40} h={5}/>
        </div>
    )
}

export default async function WelcomeCard() {

    const session = await getSession()
    if (!session) {
        return (
            <div className="card w-xs">
                <h1 className="font-bold text-xl">You are not logged in.</h1>
                <Divider mb={15} />
                <Link href="/auth/login">
                    <div className="primary-button text-center">
                        Login
                    </div>
                </Link>
            </div>
        )
    }

    return (
        <div className="card w-xs">
            <h1 className="font-bold text-xl">{`Hello ${session.name}!`}</h1>
            <Divider mb={15} />

            <div className="flex w-full justify-between">
                <button onClick={logout} className="w-1/2">
                    <div className="accent-button text-center">
                        Logout
                    </div>
                </button>

                <Link href="/library">
                    <div className="primary-button text-center">
                        View Library
                    </div>
                </Link>
            </div>
        </div>
    )
}