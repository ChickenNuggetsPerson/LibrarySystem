'use server'

import { loginUser, registerUser } from "@/auth/auth"
import { prisma } from "@/database/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"



// Does not need to be authenticated

export default async function createUser(formdata: FormData) {

    const name = formdata.get("name") as string
    const username = formdata.get("username") as string
    const password = formdata.get("password") as string
    const code = formdata.get("code") as string

    if (
        name.trim() == "" || 
        username.trim() == "" ||
        password.trim() == ""
    ) {
        throw new Error("Invalid Input")
    }


    const registrationCode = await prisma.inviteCode.findUnique({ where: { uuid: code }})
    if (!registrationCode) { return }

    try {
        await registerUser(username, password, name)
        await loginUser(username, password)
    } catch(err) {
        console.error(err)
        redirect("/")
    }

    await prisma.inviteCode.delete({ where: { uuid: code }}) // Delete Code after use

    revalidatePath("/")
    redirect("/")
}