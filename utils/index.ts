export const AT_KEY = 'at';
export const COOKIE_SECRET = 'secret';

export function validToken(tk: string) {
    return tk === 'test';
}