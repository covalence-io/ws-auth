import cookieParser from 'cookie-parser';
import { Server } from 'http';
import { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { AT_KEY, COOKIE_SECRET, validToken } from '../utils';

const HEARTBEAT_INTERVAL = 1000 * 5; // 5 seconds
const HEARTBEAT_VALUE = 1;

function onSocketPreError(e: Error) {
    console.log(e);
}

function onSocketPostError(e: Error) {
    console.log(e);
}

function ping(ws: WebSocket) {
    ws.send(HEARTBEAT_VALUE, { binary: true });
}

export default function configure(s: Server) {
    const wss = new WebSocketServer({ noServer: true });

    s.on('upgrade', (req, socket, head) => {
        socket.on('error', onSocketPreError);

        // perform auth
        cookieParser(COOKIE_SECRET)(req as Request, {} as Response, () => {
            const signedCookies = (req as Request).signedCookies;
            let at = signedCookies[AT_KEY];

            if (!at && !!req.url) {
                const url = new URL(req.url, `ws://${req.headers.host}`);
                at = url.searchParams.get('at');
            }

            if (!validToken(at)) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            wss.handleUpgrade(req, socket, head, (ws) => {
                socket.removeListener('error', onSocketPreError);
                wss.emit('connection', ws, req);
            });
        });
    });

    wss.on('connection', (ws, req) => {
        ws.isAlive = true;

        ws.on('error', onSocketPostError);

        ws.on('message', (msg, isBinary) => {
            if (isBinary && (msg as any)[0] === HEARTBEAT_VALUE) {
                // console.log('pong');
                ws.isAlive = true;
            } else {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(msg, { binary: isBinary });
                    }
                });
            }
        });

        ws.on('close', () => {
            console.log('Connection closed');
        });
    });

    const interval = setInterval(() => {
        // console.log('firing interval');
        wss.clients.forEach((client) => {
            if (!client.isAlive) {
                client.terminate();
                return;
            }

            client.isAlive = false;
            ping(client);
        });
    }, HEARTBEAT_INTERVAL);

    wss.on('close', () => {
        clearInterval(interval);
    });
}