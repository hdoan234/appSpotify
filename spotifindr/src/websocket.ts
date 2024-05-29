import { io, Socket } from 'socket.io-client';

Socket.prototype.on

const socket = io(import.meta.env.VITE_API_ROUTE || 'http://localhost:3000', { withCredentials: true, autoConnect: false });

export default socket;