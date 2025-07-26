'use client'

import Login from "@/auth/actions/Login";
import { useActionState, useEffect } from "react";
import TextInput from "../Forms/TextInput";
import toast from "react-hot-toast";




export default function LoginForm() {
    const [state, formAction] = useActionState(Login, { error: null, loggedIn: false });
    
    useEffect(() => {
        if (state.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <div>
            <form action={formAction} className="card w-sm">

                <div className="flex flex-row justify-center w-full text-2xl font-bold">
                    Login:
                </div>

                <div className="flex flex-row justify-center w-full text-md text-gray-500">
                    Login to your Library System account
                </div>

                <div className="h-5"></div>

                <TextInput id={"username"} label={"Username:"} val={""} placeholder={""} disabled={false} />
                <TextInput id={"password"} label={"Password:"} val={""} placeholder={""} disabled={false} obfuscate/>

                <button type="submit" className="w-full primary-button">Login</button>
            </form>

        </div>
    );
}