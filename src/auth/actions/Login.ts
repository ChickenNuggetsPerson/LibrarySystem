'use server'


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
    } catch {
        return { error: "Invalid Credentials", loggedIn: false }
    }

    return { error: null, loggedIn: true }
}