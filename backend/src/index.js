import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { setupRoutes } from './routes/index.js';
import { setupSockets } from './sockets/index.js';

const app = express();
app.use(cors());
app.use(express.json());

setupRoutes(app);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

setupSockets(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
