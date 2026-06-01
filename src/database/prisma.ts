import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'


const adapter = new PrismaBetterSqlite3({ url: 'data/database.sqlite' })
export const prisma = new PrismaClient({ adapter })