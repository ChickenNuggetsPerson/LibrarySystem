import { NextResponse } from 'next/server'
import type { NextRequest, ProxyConfig } from 'next/server'
import { getSession } from './auth/auth'


export default async function proxy(request: NextRequest) {

    if (request.url.endsWith("/auth/login") || request.url.endsWith("/auth/new")) { 
        return NextResponse.next() 
    }

    const session = await getSession()
    if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
}

export const config: ProxyConfig = {
    matcher: [
        '/',
        '/library/:path*',
    ],
}