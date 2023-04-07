import express from 'express';
import configureRoutes from './routers';
import configureSockets from './sockets';

const app = express();
const port = process.env.PORT || 3000;

configureRoutes(app);

console.log(`Attempting to run server on port ${port}`);

configureSockets(app.listen(port, () => {
    console.log(`Listening on port ${port}`);
}));