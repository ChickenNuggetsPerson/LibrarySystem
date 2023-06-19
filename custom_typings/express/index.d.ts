import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    firstName: { [key: string]: any },
    user: { [key: string]: any }
  }
}