import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket.IO server URL
const SOCKET_SERVER_URL = 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initializing Socket.IO connection to:', SOCKET_SERVER_URL);
    
    // Initialize Socket.IO connection with improved options
    const socketInstance = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      forceNew: true, // Force a new connection
      autoConnect: true, // Automatically connect
      reconnection: true // Enable reconnection
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', socketInstance.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server. Reason:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setIsConnected(false);
      setConnectionError(`Failed to connect: ${err.message}`);
    });

    socketInstance.on('error', (err) => {
      console.error('Socket error:', err);
      setConnectionError(`Socket error: ${err}`);
    });

    // Add heartbeat response handler
    socketInstance.on('heartbeat', (data) => {
      console.log('Received heartbeat from server:', data.timestamp);
      socketInstance.emit('heartbeat-response');
    });

    // Add reconnection events
    socketInstance.io.on('reconnect', (attempt) => {
      console.log(`Reconnected to server after ${attempt} attempts`);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.io.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });

    socketInstance.io.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
      setConnectionError(`Reconnection failed: ${error.message}`);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up Socket.IO connection');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
}; 