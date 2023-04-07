import { Router } from 'express';
import { AT_KEY } from '../utils';

export default function users() {
    const router = Router();

    router
        .get('/', (req, res, next) => {
            res.json({
                id: 1,
                firstname: 'Matt',
                lastname: 'Morgan',
            });
        })
        .get('/login', (req, res, next) => {
            // check creds
            // encode token
            const tk = 'test';

            res.cookie(AT_KEY, tk, {
                httpOnly: true,
                signed: true,
            });

            res.status(200).send(tk);
        })
        .get('/logout', (req, res, next) => {
            res.clearCookie(AT_KEY);
            res.status(200).send();
        });

    return router;
}