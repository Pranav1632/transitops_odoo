import http from 'http';
import app from './app';
import { initSocket } from './shared/socket/io';
import { logger } from './shared/logger/pino';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
export { server };
