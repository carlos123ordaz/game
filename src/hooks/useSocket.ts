import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { connectToNamespace, disconnectFromNamespace } from '../services/socket';

interface UseSocketOptions {
  namespace: string;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useSocket({ namespace, autoConnect = true }: UseSocketOptions): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    setIsConnecting(true);
    setError(null);

    const socket = connectToNamespace(namespace);
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (err: Error) => {
      setIsConnecting(false);
      setError(`Error de conexión: ${err.message}`);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) {
      setIsConnected(true);
      setIsConnecting(false);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      disconnectFromNamespace(namespace);
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [namespace, autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
  };
}
