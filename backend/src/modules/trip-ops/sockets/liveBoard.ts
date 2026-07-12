import { Server, Socket } from 'socket.io';

/**
 * Registers Socket.io listeners for Live Board operations
 * Allows clients to subscribe/unsubscribe to trip updates and room events
 */
export const registerLiveBoardSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected to live board: ${socket.id}`);

    // Allow clients to join a dedicated room for live trip updates
    socket.on('subscribe_trips', () => {
      socket.join('trips:live');
      console.log(`Socket ${socket.id} joined 'trips:live' room`);
    });

    socket.on('unsubscribe_trips', () => {
      socket.leave('trips:live');
      console.log(`Socket ${socket.id} left 'trips:live' room`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected from live board: ${socket.id}`);
    });
  });
};
