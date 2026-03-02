import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config/constants';

/* ═══════════════════════════════════════════
   SOCKET SERVICE — Connection manager
   ═══════════════════════════════════════════

   Usage:
     const socket = connectToNamespace('/quiz');
     socket.on('room-created', ...);
     // later:
     disconnectFromNamespace('/quiz');
   ═══════════════════════════════════════════ */

const sockets = new Map<string, Socket>();

export function connectToNamespace(namespace: string): Socket {
  const existing = sockets.get(namespace);
  if (existing?.connected) return existing;

  const socket = io(`${API_URL}${namespace}`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  sockets.set(namespace, socket);

  socket.on('connect', () => {
    console.log(`[socket] connected to ${namespace}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[socket] disconnected from ${namespace}: ${reason}`);
  });

  socket.on('connect_error', (err) => {
    console.error(`[socket] connection error on ${namespace}:`, err.message);
  });

  return socket;
}

export function getSocket(namespace: string): Socket | undefined {
  return sockets.get(namespace);
}

export function disconnectFromNamespace(namespace: string): void {
  const socket = sockets.get(namespace);
  if (socket) {
    socket.disconnect();
    sockets.delete(namespace);
  }
}

export function disconnectAll(): void {
  sockets.forEach((socket) => socket.disconnect());
  sockets.clear();
}
