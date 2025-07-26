'use server'



import { redirect } from 'next/navigation';
import { invalidateSession } from '../auth';
import { revalidatePath } from 'next/cache';






export async function logout() {
    await invalidateSession()
    revalidatePath("/")
    redirect("/")
}
