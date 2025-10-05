export function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('message', (msg) => {
      io.emit('message', msg);
    
    });
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}
