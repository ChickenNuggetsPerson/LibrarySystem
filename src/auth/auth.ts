import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hashPassword, signSession, verifySession } from './encryption';
import bcrypt from 'bcryptjs';
import { prisma } from '@/database/prisma';



export interface Session {
    userID: string,
    isAdmin: boolean,
    name: string,

    libraryUUID: string
}

// Function for user login

// Validates user and sets the propper cookies
// Used in Login process
export async function loginUser(username: string, password: string) {


    // Check for authentication :3
    if (username == process.env.ADMIN_USER && password == process.env.ADMIN_PASS) {
        const session = await getSession()
        if (!session) { throw new Error("Invalid Credentials") }

        await updateSession({
            userID: session.userID,
            isAdmin: false,
            name: '',
            libraryUUID: ''
        })

    } else {

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            include: { library: true }
        })

        if (!user) { throw new Error("Invalid Credentials") }

        const match = await bcrypt.compare(password, user.passHash)
        if (!match) { throw new Error("Invalid Credentials") }

        await updateSession({
            userID: user.uuid,
            isAdmin: false,
            name: user.name,
            libraryUUID: user.library?.uuid ?? ""
        })
    }
}


// Updates the user's session
export async function updateSession(session: Session) {

    const token = await signSession(session)

    const age = 60 * 60 * (session.isAdmin ? 0.5 : 2) // 0.5 hours for SysAdmin, 2 hours for regular users

    const cookieStore = await cookies()
    cookieStore.set("session", token, { // Set session
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
        path: "/",
        maxAge: age,
        sameSite: "lax"
    })
}

export async function refreshSession() { // Refreshes the session expire time 
    const session = await getSession()
    if (session) {
        updateSession(session)
    }
    return session ?? {} as Session
}


// Creates the user in the database
export async function registerUser(username: string, password: string, name: string) {
    const authHash = hashPassword(password)

    const user = await prisma.user.create({
        data: {
            name: name,
            username: username,
            passHash: authHash
        }
    })
    await prisma.library.create({
        data: {
            name: `${name}'s Library`,
            userId: user.uuid
        }
    })

}





// Functions for verifying API requests...

export async function getUserFromSession() {
    const session = await getSession()
    if (!session) { return null }

    const user = await prisma.user.findUnique({ where: { uuid: session.userID }, include: { library: true } })
    if (user) {
        user.passHash = "" // Don't send around them the password hash
    }
    return user
}

export async function getSession(): Promise<Session | null> {
    const token = (await cookies()).get('session')?.value;
    if (!token) return null;
    return await verifySession(token) as Session | null;
}

export async function isValidSession() {
    const session = await getSession()
    if (session) {
        return true
    }
    return false
}

export async function throwIfInvalidSession() {
    const session = await getSession()
    if (!session) {
        throw new Error("Unauthorized")
    }
    return session
}

export async function redirectIfInvalidSession() {
    if (!(await isValidSession())) {
        redirect("/login")
    }
}

export async function invalidateSession() {
    const cookieStore = await cookies();

    const encryptToken = cookieStore.get('session')?.value;
    if (!encryptToken) { return }

    cookieStore.delete("session")
}



export async function throwIfNotSYSAdmin() {
    const result = await isSYSAdmin()
    if (!result) {
        throw new Error("Not System Admin")
    }
}
export async function isSYSAdmin() {
    const session = await getSession()
    if (!session) {
        throw new Error("Invalid Session")
    }
    return session.isAdmin
}