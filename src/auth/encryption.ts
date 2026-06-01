import bcrypt from 'bcryptjs';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { Session } from './auth';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const alg = 'HS256';

export async function signSession(payload: Session) {
    return await new SignJWT(payload as unknown as JWTPayload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret);
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}



export function hashPassword(password: string) {
    return bcrypt.hashSync(password, 12)
}