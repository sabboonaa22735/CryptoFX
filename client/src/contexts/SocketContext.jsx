import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef(new Set());

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

  useEffect(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      console.log('[SocketProvider] Connected');
      setIsConnected(true);
      
      if (subscriptionsRef.current.size > 0) {
        socketRef.current.emit('subscribe', Array.from(subscriptionsRef.current));
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('[SocketProvider] Disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.log('[SocketProvider] Connection error (will retry):', error.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const subscribe = useCallback((channels) => {
    if (!Array.isArray(channels)) channels = [channels];
    channels.forEach(channel => subscriptionsRef.current.add(channel));
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', channels);
    }
  }, []);

  const unsubscribe = useCallback((channels) => {
    if (!Array.isArray(channels)) channels = [channels];
    channels.forEach(channel => subscriptionsRef.current.delete(channel));
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', channels);
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current?.off(event, callback);
    }
    return () => {};
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    subscribe,
    unsubscribe,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
