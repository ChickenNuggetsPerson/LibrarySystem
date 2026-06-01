'use server'

import { redirect } from 'next/navigation';
import { invalidateSession } from '../auth';






export async function logout() {
    await invalidateSession()
    redirect("/")
}
