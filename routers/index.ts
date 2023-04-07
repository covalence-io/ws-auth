import express, { Application, Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { resolve } from 'path';
import { COOKIE_SECRET } from '../utils';
import api from './api';

export default function configure(app: Application) {
    app
        .get('/', (req, res, next) => {
            res.sendFile(resolve(__dirname, '../index.html'));
        })
        .use(express.static('public'))
        .use(json())
        .use(cookieParser(COOKIE_SECRET))
        .use('/api', api())
        .use('/error', (req, res, next) => {
            next(new Error('Other Error'));
        })
        .use((req, res, next) => {
            next(new Error('Not Found'));
        })
        .use((error: Error, req: Request, res: Response, next: NextFunction) => {
            switch (error.message) {
                case 'Not Found':
                    res.sendFile(resolve(__dirname, '../notfound.html'));
                    return;
            }

            res.sendFile(resolve(__dirname, '../error.html'));
        });
}