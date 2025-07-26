'use server'


import { redirect } from "next/navigation";
import { loginUser } from "../auth";


type LoginState = { error: string | null, loggedIn: boolean };

export default async function login(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
        await loginUser(username, password);
        redirect("/")
    } catch {
        return { error: "Invalid Credentials", loggedIn: false }
    }
}